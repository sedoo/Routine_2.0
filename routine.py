#! /home/benahmed/flask/venv/bin/python3
# -*- coding: UTF-8 -*-

from reseauxPy3 import *
from xml.dom import minidom
from flask import Flask, render_template, request, redirect, url_for
from flask_cors import CORS
import re
import os

import config
import signal
import atexit
import socket
import py_eureka_client.eureka_client as eureka_client

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

from PIL import Image
import glob

profile = os.getenv("APP_PROFILE", "dev")
port = int(os.getenv("PORT", 8000))  # port injecté par le shell

def get_host_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def shutdown_handler(*args):
    print("Unregistering from Eureka...")
    eureka_client.stop()
    print("Unregistered from Eureka...")

def signal_handler(sig, frame):
    shutdown_handler()
    sys.exit(0)

if profile == "prod":
    instance_ip = get_host_ip()
    eureka_client.init(
        eureka_server=config.EUREKA_SERVER,
        app_name=config.APP_NAME,
        instance_host=instance_ip,
        instance_port=port,
        should_register=True
    )

    atexit.register(shutdown_handler)
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

app = Flask(__name__)
CORS(app)

app.config["IMAGE_UPLOADS"] = "./static/Photos"

#destinataires = ['sebastien.benahmed@irap.omp.eu', 'Matthieu.Sylvander@irap.omp.eu', 'Marie.Calvet@irap.omp.eu', 'fgrimaud@irap.omp.eu', 'Helene.pauchet@irap.omp.eu', 'jean.letort@irap.omp.eu']
destinataires = ['sebastien.benahmed@irap.omp.eu']

def icone(sta, fic):
    # fonction qui transforme les images en icones
    size = (128, 128)
    saved = "%s/%s/icone_%s" % (app.config["IMAGE_UPLOADS"], sta, fic)
    loaded = "%s/%s/%s" % (app.config["IMAGE_UPLOADS"], sta, fic)
    print("Icone : *** %s  %s***" % (loaded, saved))

    try:
        im =  Image.open(loaded)
        im.thumbnail(size)
        im.save(saved)
    except:
        print("Unable to load image")

    #im.thumbnail(size)
    #im.save(saved)


# mise a jour de la station
lStations = LStations("./static/xml/listeSta.xml")
station = {}
for sta in  lStations.liste:
    station[sta] = Station(sta, lStations.fichierXml[sta])
    station[sta].etatActuel()

###############################################################################
####    TABLEAU ETAT DES STATIONS

@app.route('/')
@app.route('/index.html/')
def listeStations():
    return render_template('index.html', lStations = lStations, station = station, time = time)


@app.route('/majStation.html', methods=['GET', 'POST'])
def majStation():
    if request.method == 'POST':

        ### Après validation
        # mise à jour du fichier xml
        lst_cle = ""
        for cle in request.form:
            lst_cle = "%s <br/> %s --- %s" % (lst_cle, cle, request.form[cle])
        Evenement().nouveau(request.form)
        
        # envoi de mail
        htmlMail = render_template('mail_majStation.html',
            stationID = request.form['stationID'],
            dateDebut = request.form['debut'],
            etat = request.form['etat'],
            typeEvt = request.form['typeEvt'],
            description = request.form['description']
        )
        leMessage = MIMEMultipart ('alternative') # création d'un message
        leMessage.attach(MIMEText(htmlMail, 'html', 'utf-8')) # ajout du contenu (texte plus images)
        leMessage['From']    = "routine@irap.omp.eu"
        leMessage['To']      = ','.join(destinataires)
        leMessage['Subject'] = "PB nouveau probleme le %s a la station %s" % (request.form['debut'], request.form['stationID'])

        #leServeurSMTP = smtplib.SMTP('smtp.irap.omp.eu') # envoi du messge
        leServeurSMTP = smtplib.SMTP('smtp.orange.fr') # envoi du messge
        leServeurSMTP.sendmail('sebastien.benahmed@irap.omp.eu',
            destinataires,
            leMessage.as_string())
        leServeurSMTP.quit()

        return redirect(url_for('listeStations'))
    else:
        ### avant le remplissage du formulaire
        stationID = request.args['stationID']
        dateDebut = request.args['debut']
        idEvent = request.args['idEvt']
        connStation = station[stationID].etatActuel["connStation"]
        return render_template('./majStation.html', stationID = stationID, dateDebut = dateDebut, idEvent = idEvent, connStation = connStation)


###############################################################################
####    COMPTE RENDU D'INTERVENTION

@app.route('/CR_intervention.html', methods=['POST', 'GET'])
def CR_intervention():
    liste_sta = lStations.liste

    if 'validationCR' in request.form and request.form['validationCR'] == 'valider':

        ### Page de CR après validation
        # mise à jour du fichier xml
        caracEvts = []
        station = Station(request.form['station'], lStations.fichierXml[request.form['station']]) 
        station.etatActuel()
        for i in range(0, station.nbEvt):
            sta = station.evenement[i].__dict__
            caracEvt = {}
            for cle in sta:
                if isinstance(sta[cle], str):
                    caracEvt[cle] = sta[cle]
                    #print("%s --- %s" % (cle, caracEvt[cle]))
            if 'resolu[%s]' % caracEvt['idEvt'] in request.form and request.form['resolu[%s]' % caracEvt['idEvt']] == 'on':
                caracEvt['fin'] = request.form['date']
                Evenement().modif(caracEvt)
            caracEvts.append(caracEvt)
            if 'commEvt[%s]' % caracEvt['idEvt'] in request.form:
                caracEvt['commentaire'] = request.form['commEvt[%s]' % caracEvt['idEvt']]
            del caracEvt

        # mise a jour du fichier xml pour l'entretien des stations
        entretien = {}
        entretien = {'date': request.form['dateEnt'], 'motif': request.form['motif']}

        intervention = Intervention(request.form['station'], request.form['date'])

        if request.form['commentaires'] != "":
            intervention.nouveau(request.form['nomIntervenant'], caracEvts, entretien, request.form['commentaires'])
        else:

            ### Page de CR après séléction de la station
            intervention.nouveau(request.form['nomIntervenant'], caracEvts, entretien)


        # sauvegarde les photos et les icones
        ficPdf = ""
        lstPhotos = []
        if "photos" in request.files:

            lFic = request.files.getlist('photos')
            for fic in lFic:
                if fic.filename == '': break

                repPhotos = "%s/%s" % (app.config["IMAGE_UPLOADS"], request.form['station'])
                       
                # renome les photos
                if re.match(r"\d{8}_", fic.filename) == None:
                    dateFic = re.sub(r"(\d{4})\.(\d{2})\.(\d{2})", r"\1\2\3_", request.form['date'])
                    nomPhoto = "%s%s" % (dateFic, fic.filename)
                else:
                    nomPhoto = fic.filename

                print("%s/%s" % (repPhotos, nomPhoto))
                lstPhotos.append("%s/%s" % (repPhotos, nomPhoto))

                # sauvegarde la photo
                fic.save(os.path.join(repPhotos, nomPhoto))
                # cree l'icone
                #icone(form['station'].value, nomPhoto)
                if nomPhoto.split('.')[-1] != "pdf":
                    #icone(request.form['station'], nomPhoto)
                    print("Creation de l'icone")
                    icone(request.form['station'], nomPhoto)
                    
                else:
                    ficPdf = nomPhoto

        # envoi de mail
        htmlMail = render_template('mail_CRintervention.html',
            form = request.form,
            caracEvts = caracEvts,
            lstPhotos = lstPhotos
        )
        #    nomStation = request.form['station'],
        #    nom = request.form["nomIntervenant"],
        #    date = request.form['date']
        #)

        leMessage = MIMEMultipart ('alternative') # création d'un message
        leMessage.attach(MIMEText(htmlMail, 'html', 'utf-8')) # ajout du contenu (texte plus images)
        leMessage['From']    = "routine@irap.omp.eu"
        leMessage['To']      = ','.join(destinataires)
        leMessage['Subject'] = "CR de l'intervention de %s le %s pour %s" % (request.form['nomIntervenant'], request.form['date'], request.form['station'])

        #leServeurSMTP = smtplib.SMTP('smtp.irap.omp.eu') # envoi du messge
        leServeurSMTP = smtplib.SMTP('smtp.orange.fr') # envoi du messge
        leServeurSMTP.sendmail('sebastien.benahmed@irap.omp.eu',
            destinataires,
            leMessage.as_string())
        leServeurSMTP.quit()

        return redirect(url_for('listeStations'))

    elif 'validStation' in request.form:

        ### selection de la station
        station = Station(request.form['station'], lStations.fichierXml[request.form['station']])
        station.etatActuel()
        return render_template('CR_intervention.html', liste_sta = liste_sta, lstChamps = request.form, station = station)

    else:

        ### avant le remplissage du formulaire
        return render_template('CR_intervention.html', liste_sta = liste_sta)


###############################################################################
####    HISTORIQUE DES INTERVENTIONS

@app.route('/HI_interventions.html', methods=['GET', 'POST'])
def HI_interventions(): 

    liste_sta = lStations.liste
    #if request.method == 'POST' in request.form:

    if len(request.form) > 0:

        ### affichage de l'historique de la station selectionnee
        station = Station(request.form['station'], lStations.fichierXml[request.form['station']])
        station.listeInt()
        return render_template('HI_interventions.html', liste_sta = liste_sta, listeInt = station.interventions, station = request.form['station'])
        print ("####################################")        

    else:

        ### avant la selection de la station
        return render_template('HI_interventions.html', liste_sta = liste_sta )


###############################################################################
####    PHOTOS DES STATIONS

@app.route('/photos.html', methods=['GET', 'POST'])
def listePhotos(): 

    liste_sta = lStations.liste

    print(len(request.form))
    if len(request.form) > 0:

        print("après")
        print(request.form['station'])
        repSta = '%s/%s/20*' % (app.config["IMAGE_UPLOADS"], request.form['station'])
        # liste les photos
        lFic = glob.glob(repSta)
        print(lFic)
        # trie les photos
        lPhotos = {}
        
        for fic in lFic:
            date = re.findall(r"(\d{4}\d{2}\d{2})", fic)
            lPhotos[date[0]] = []

        lDates = sorted(lPhotos, reverse=True)

        for fic in lFic:
            date = re.findall(r"(\d{4}\d{2}\d{2})", fic)
            icone = re.sub(r"^(.*)(\d{4}\d{2}\d{2}_)(.*)$", r"\1icone_\2\3", fic)
            photo = [fic, icone]
            lPhotos[date[0]].append(photo)

        return render_template('photos.html', liste_sta = liste_sta, liste_photos = lPhotos, liste_dates = lDates, station = request.form['station'])

    else:

        ### avant la selection de la station
        print("avant")
        return render_template('photos.html', liste_sta = liste_sta )


###############################################################################
###### carte des stations et maintenance

@app.route('/carteStations.html')
def maintenance():

    return render_template('carteStations.html')


@app.route('/renass96.html')
def pwd():
    #return render_template('pwd.html')
    return render_template('renass96.html')


if __name__ == "__main__":
    app.run(debug=True)



#cgitb.enable()


#lStations = LStations("xml/listeSta.xml")
#station = {}
#for sta in  lStations.liste:
#    station[sta] = Station(sta, lStations.fichierXml[sta])
#    station[sta].etatActuel()

# Liste des stations

