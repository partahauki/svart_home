from PyP100 import PyP100
from pynput.keyboard import Key, Listener
from func_timeout import func_timeout, FunctionTimedOut
from dotenv import dotenv_values
import paho.mqtt.client as mqtt

env = dotenv_values(".env")

USING_INPUT_DEBUG = str(env["USING_INPUT_DEBUG"]) == "true"
ACTIVATION_KEY = str(env["ACTIVATION_KEY"])
PLUG_IP = str(env["PLUG_IP"])
USER_EMAIL = str(env["USER_EMAIL"])
USER_PASSWORD = str(env["USER_PASSWORD"])
MQTT_BROKER_ADDR = str(env["MQTT_BROKER_ADDR"])
MQTT_BROKER_PORT = int(env["MQTT_BROKER_PORT"])

class Coffee:
    __P110 = None
    __listener = None
    __mqtt_client = None

    def __init__(self):
        self.__P110 = self.__connect_plug()
        self.__listener = Listener(on_press = self.__handle_input)
        self.__mqtt_client = self.__init_mqtt()

    def listen(self):
        self.__listener.start()

    def __connect_plug(self):
        print("Hello, connecting to plug...")

        while True:
            try:
                __P110 = PyP100.P100(PLUG_IP, USER_EMAIL, USER_PASSWORD)
                __P110.handshake()
                __P110.login()
                print("Connection successful")
                return __P110
            except:
                print("Error connecting to coffee, trying again...")

    def __init_mqtt(self):
        def on_connect(client, userdata, flags, rc):
            print("Connected to MQTT-broker with result code " + str(rc))
        def on_message(client, userdata, msg):
            print(str(msg.topic) + ": " + str(msg.payload))
            if msg.topic == "home/coffee/toggle":
                func_timeout(5, self.__toggle_status)
            if msg.topic == "home/coffee/queryStatus":
                func_timeout(5, self.__publish_status)

        client = mqtt.Client("coffee-connection-1")
        client.on_connect = on_connect
        client.on_message = on_message
        client.connect(MQTT_BROKER_ADDR, MQTT_BROKER_PORT)
        client.subscribe("home/coffee/status")
        client.subscribe("home/coffee/queryStatus")
        client.subscribe("home/coffee/toggle")
        client.loop_start()
        return client

    def __is_input_activation_key(self, input_key):
        input_char = None
        try:
            input_char = input_key.char
            USING_INPUT_DEBUG and print("key was " + str(input_key))
        except:
            USING_INPUT_DEBUG and print("non-char value with input")
            return False

        return input_char == ACTIVATION_KEY

    def __toggle_status(self):
        self.__P110.toggleState()
        self.__publish_status()

    def __publish_status(self):
        try:
            status = self.__P110.getDeviceInfo()["result"]
            is_device_on = status["device_on"]
        except Exception as e:
            raise e

        if is_device_on:
            self.__mqtt_client.publish("home/coffee/status", "ON")
        else:
            self.__mqtt_client.publish("home/coffee/status", "OFF")

    def __handle_input(self, key):
        if not self.__is_input_activation_key(key):
            return

        try:
            func_timeout(5, self.__toggle_status)
        except FunctionTimedOut:
            print("Coffee machine is not responding in a timely manner")
            self.__mqtt_client.publish("home/coffee/error", "Coffee machine is not responing in a timely manner")
        except Exception as e:
            print(e)
            self.__mqtt_client.publish("home/coffee/error", e)
