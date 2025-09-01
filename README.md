# Routine_2.0


## Procédures installation

```
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Lancement en local

```
python3.11 routine.py
```

This message should appears in the terminal 

```
 * Serving Flask app 'routine'
 * Debug mode: on
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
 * Restarting with stat
```

## Lancement part script

Local

```
~/git/Routine_2.0$ ./start.sh 
👉 Variables chargées depuis /home/tromuald/git/Routine_2.0/.env.dev
👉 APP_PROFILE=dev
🚀 Lancement en mode dev sur le port 8000
[2025-09-01 13:02:52 +0200] [54588] [INFO] Starting gunicorn 23.0.0
[2025-09-01 13:02:52 +0200] [54588] [INFO] Listening at: http://0.0.0.0:8000 (54588)
[2025-09-01 13:02:52 +0200] [54588] [INFO] Using worker: sync
[2025-09-01 13:02:52 +0200] [54593] [INFO] Booting worker with pid: 54593
```

Production

```
APP_PROFILE=prod /data/services/Routine_2.0/start.sh
👉 Variables chargées depuis /data/services/Routine_2.0/.env.prod
👉 APP_PROFILE=prod
🚀 Utilisation du port libre 51579
[2025-09-01 13:00:39 +0200] [202088] [INFO] Starting gunicorn 23.0.0
[2025-09-01 13:00:39 +0200] [202088] [INFO] Listening at: http://0.0.0.0:51579 (202088)
[2025-09-01 13:00:39 +0200] [202088] [INFO] Using worker: sync
[2025-09-01 13:00:39 +0200] [202094] [INFO] Booting worker with pid: 202094
```

## Lancement service en production

```
sudo systemctl start Routine_2.0.service
```

Check service status

```
sudo systemctl status Routine_2.0.service
```

