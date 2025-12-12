#clase main.py

from app.config.consul import start_consul_connection
from app.config.rabbitmq import start_rabbit
from app.service.congestiones_service import start_congestiones_service

import threading

def main():
    
    start_rabbit() 
    start_consul_connection()

    print("[*] Congestiones service is running...")
    start_congestiones_service() 

if __name__ == "__main__":
    main()