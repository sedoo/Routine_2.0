#! /usr/bin/python
# -*- coding: UTF-8 -*-

from xml.dom import minidom


xmlfic = minidom.parse('./xml/PYHE.xml')

interventions = []

for interv in xmlfic.getElementsByTagName('intervention'):
    intervention = {}
    intervention['intervenant'] = interv.getElementsByTagName('intervenant')[0].firstChild.nodeValue
    intervention['date'] = interv.attributes['date'].value
    if interv.getElementsByTagName('commentaires').length > 0:
        intervention['commentaires'] = interv.getElementsByTagName('commentaires')[0].firstChild.nodeValue
    else:
        intervention['commentaires'] = ""

    intervention['evt'] = []
    for evt in interv.getElementsByTagName('evt'):
        idEvt = evt.attributes['idEvt'].value
        if evt.getElementsByTagName('commentaire').length > 0:
            commentaire = evt.getElementsByTagName('commentaire')[0].firstChild.nodeValue
        else:
            commentaire = ""

        if evt.getElementsByTagName('fin').length > 0:
            fin = 'X'
        else:
            fin = ''

        intervention['evt'].append({
            'idEvt': idEvt,
            'commentaire': commentaire,
            'fin': fin
        })
        
    
    interventions.append(intervention)

for intervention in interventions:
    print("%s %s %s" % (intervention['intervenant'], intervention['date'], intervention['commentaires']))
    for evt in intervention['evt']:
        print("%s %s %s" % (evt['idEvt'], evt['commentaire'], evt['fin']))
