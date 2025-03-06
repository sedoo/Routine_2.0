#! /usr/bin/python
# -*- coding: UTF-8 -*-

from xml.dom import minidom
import re
import time
import codecs

class Station:
    '''Classe definissant une station a partir d'un fichier xml
    Elle contient la methode etatActuel() qui lui attribut ses caracteristiques
    actuelles.'''

    def __init__(self, nom, fichier=None):
        '''Un fichier se definit a partir du fichier xml'''
        self.nom = nom
        try:
            self.fichier = '%s.xml' % nom
        except fichier:
            self.fichier = fichier

        xmlfic = minidom.parse('./xml/%s' % self.fichier)
        self.xmlfic = xmlfic

    def etatActuel(self):
        '''Methode qui releve les caracteristiques de l'etat actuel de la station''' 
        evenements = []
        etatActuel = {}
        coulActuel = {}
        etatActuel['etat'] = 'OK'
        etatActuel['debut'] = 'OK'
        etatActuel['typeEvt'] = 'OK'
        etatActuel['connStation'] = "OK"
        etatActuel['connRouteurModem'] = "OK"
        etatActuel['battCharg'] = "OK"
        etatActuel['GPSTempsg'] = "OK"
        etatActuel['etatSignal'] = "OK"
       
        xmlfic = minidom.parse('./xml/%s' % self.fichier)
        for evenement in xmlfic.getElementsByTagName('evenement'):
            if evenement.getElementsByTagName('fin'):
                pass
            elif Evenement(evenement).etat == 'HS' or etatActuel['etat'] == 'HS':
                etatActuel['etat'] = 'HS'
            elif Evenement(evenement).etat == 'Pb':
                etatActuel['etat'] = 'Pb'

            if evenement.getElementsByTagName('fin'):
                pass
            else :
                evtActuel = Evenement(evenement).__dict__
                for key,arg in etatActuel.items():
                    p = {'OK' : 0, '???' : 1, 'Pb' : 2, 'HS' : 3, '' : 4}
                    if p.has_key(evtActuel[key]):
                        if p[evtActuel[key]] > p[arg]:
                            etatActuel[key] = evtActuel[key]
                    coulActuel[key] = Couleur(etatActuel[key]).couleur
                    etatActuel['debut'] = evtActuel['debut']
                evenements.insert(0, Evenement(evenement))

        coulActuel['etat'] = Couleur(etatActuel['etat']).couleur
        self.evenement = evenements
        self.nbEvt = len(evenements)
        self.etatActuel = etatActuel
        self.coulActuel = coulActuel
        
    def interventions(self, listeInt):
        '''Methode affichant la liste des interventions de la station'''

        self.listeInt = listeInt
        xmlfic = self.xmlfic

        for intervention in xmlfic.getElementsByTagName('intervention'):
#            if intervention.getElementsByTagName('fin'):
#                pass
#            else:
            intervention.setAttribute('station', self.nom)
            if listeInt.hasChildNodes():
                for int in listeInt.childNodes:
                    if int.getAttribute('date') < intervention.getAttribute('date'):
                        listeInt.insertBefore(intervention, int)
                        break
                    else:
                        listeInt.appendChild(intervention)
            else:
                listeInt.appendChild(intervention)

        self.listeInt = listeInt

    def listeEvt(self):
        '''Methode affichant la liste des evenements / id'''

        xmlfic = self.xmlfic
        evenement = {}

        for evt in xmlfic.getElementsByTagName('evenement'):
            evenement[evt.getAttribute('idEvt')] = evt

        self.evenement = evenement

class Evenement:
    '''Classe contenant les caracteristiques d'un evenement'''

    def __init__(self, evenement=None):
        self.debut = "???"
        self.typeEvt = "???"
        self.connStation = "???"
        self.connRouteurModem = "???"
        self.battCharg = "???"
        self.GPSTemps = "???"
        self.signal = "???"
        self.description = ""
        self.evenement = evenement
        if evenement:
            self.idEvt = evenement.attributes['idEvt'].value
            for i in range(0, len(evenement.childNodes)):
                if evenement.childNodes[i].nodeType == minidom.Node.ELEMENT_NODE:
                    setattr(self, evenement.childNodes[i].nodeName, evenement.childNodes[i].firstChild.data)

    def nouveau(self, caracEvt):
        '''Methode ajoutant un nouvel evenement a la balise historique'''

        self.caracEvt = caracEvt
        xmlfic = minidom.parse('./xml/' + caracEvt['stationID'] + '.xml')
        historique = xmlfic.getElementsByTagName('historique')[0]

        newEvt = xmlfic.createElement('evenement')
        newEvt.setAttribute('date', caracEvt['debut'])
        newEvt.setAttribute('idEvt', caracEvt['idEvt'])

        for key, value in caracEvt.items():
            newElement =  xmlfic.createElement(key)
            u = value.decode('utf-8')
            text = xmlfic.createTextNode(u)
            newElement.appendChild(text)
            newEvt.appendChild(newElement)

        historique.appendChild(newEvt)

        text = xmlfic.toprettyxml()
        text = re.sub(r'\t+\n', '', text)
        text = re.sub(r'\n\t+([^<>\n\t]+)\n\t+', r'\1', text)
        text = re.sub(r'\n\n', '\n', text)
        f = codecs.open('./xml/' + caracEvt['stationID'] + '.xml', 'w', encoding='utf-8')
        f.write(text)
        f.close()


    def modif(self, caracEvt):
        '''Methode modifiant un evenement dans le fichier xml'''

        self.caracEvt = caracEvt
        xmlfic = minidom.parse('./xml/' + caracEvt['stationID'] + '.xml')
        historique = xmlfic.getElementsByTagName('historique')[0]

        newEvt = xmlfic.createElement('evenement')
        newEvt.setAttribute('date', caracEvt['debut'])
        newEvt.setAttribute('idEvt', caracEvt['idEvt'])

        for key, value in caracEvt.items():
            newElement =  xmlfic.createElement(key)
            u = value.decode('utf-8')
            text = xmlfic.createTextNode(u)
            newElement.appendChild(text)
            newEvt.appendChild(newElement)

        for oldEvt in xmlfic.getElementsByTagName('evenement'):
            if oldEvt.getAttribute('idEvt') == caracEvt['idEvt']:
                historique.replaceChild(newEvt, oldEvt)
        
        text = xmlfic.toprettyxml()
        text = re.sub(r'\t+\n', '', text)
        text = re.sub(r'\n\t+([^<>\n\t]+)\n\t+', r'\1', text)
        text = re.sub(r'\n\n', '\n', text)
        f = codecs.open('./xml/' + caracEvt['stationID'] + '.xml', 'w', encoding='utf-8')
        f.write(text)
        f.close()



class LStations:
    '''Classe definissant une liste des stations a partir d'un fichier xml.
    Elle cree aussi un dictionnaire contenant le nom de la station 
    et les fichier xml correspondant'''

    def __init__(self, fichierXML):
        '''La liste et le dictionnaire se definissent a partir d'un fichier xml 
        contenant les elements nom et fichier, le tout dans l'element station'''
        self.xmlfic = fichierXML
        lStations = []
        lXml = {}
        xmlfic = minidom.parse('./xml/listeSta.xml')
        listStation = xmlfic.getElementsByTagName('station')
        for i in range(0, len(listStation)):
            nom = listStation[i].attributes['nom'].value
            lStations.append(nom)
            fichierXml = listStation[i].attributes['fichier'].value
            lXml[nom] = fichierXml
        self.liste = lStations
        self.fichierXml = lXml

class Couleur:
    '''Classe definissant la balise couleur d'un texte si HS ou Pb'''

    def __init__(self, etat):
        self.etat = etat
        if etat == 'HS':
            self.couleur = ' style="background-color: #FF0000"'
        elif etat == 'Pb':
            self.couleur = ' style="background-color: #AAAAAA"'
        else:
            self.couleur = ''

class Intervention:
    '''Classe definissant les caracteristiques d'une intervention'''

    def __init__(self, stationID, date):
        self.stationID = stationID
        self.date = date

    def nouveau(self, nom, caracEvts, entretien, commentaires=None):
        stationID = self.stationID
        date = self.date
        self.nom = nom
        self.commentaires = commentaires
        self.caracEvts = caracEvts
        #self.dateEnt = dateEnt
        self.entretien = entretien

        xmlfic = minidom.parse('./xml/' + stationID + '.xml')
        interventions = xmlfic.getElementsByTagName('interventions')[0]
        
        newInt = xmlfic.createElement('intervention')
        newInt.setAttribute('date', date)

        newNom = xmlfic.createElement('intervenant')
        u = nom.decode('utf-8')
        text = xmlfic.createTextNode(u)
        newNom.appendChild(text)
        newInt.appendChild(newNom)

        if commentaires:
            newCom = xmlfic.createElement('commentaires')
            u = commentaires.decode('utf-8')
            text = xmlfic.createTextNode(u)
            newCom.appendChild(text)
            newInt.appendChild(newCom)

        for caracEvt in caracEvts:
            print caracEvt
            newEvt = xmlfic.createElement('evt')
            newEvt.setAttribute('idEvt', caracEvt['idEvt'])
            newInt.appendChild(newEvt)

            if caracEvt.has_key('commentaire'):
                newComEvt = xmlfic.createElement('commentaire')
                u = caracEvt['commentaire'].decode('utf-8')
                text = xmlfic.createTextNode(u)
                newComEvt.appendChild(text)
                newEvt.appendChild(newComEvt)

            if caracEvt.has_key('fin'):
                newFinEvt = xmlfic.createElement('fin')
                u = caracEvt['fin'].decode('utf-8')
                text = xmlfic.createTextNode(u)
                newFinEvt.appendChild(text)
                newEvt.appendChild(newFinEvt)
                
        interventions.appendChild(newInt)

        # modification de la date du prochain entretien et du motif
        if entretien['date'] is not '':
            dateEntretien = xmlfic.getElementsByTagName('entretien')[0]
            dateEntretien.setAttribute('date', entretien['date'])
            dateEntretien.setAttribute('motif', entretien['motif'])

        text = xmlfic.toprettyxml()
        text = re.sub(r'\t+\n', '', text)
        text = re.sub(r'\n\t+([^<>\n\t]+)\n\t+', r'\1', text)
        text = re.sub(r'\n\n', '\n', text)
        f = codecs.open('./xml/' + stationID + '.xml', 'w', encoding='utf-8')
        f.write(text)

        print './xml/' + stationID + '.xml'
