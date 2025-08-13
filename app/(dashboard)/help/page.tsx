"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, 
  BookOpen, 
  Users, 
  Trophy, 
  AlertTriangle,
  BarChart3,
  Settings,
  Monitor,
  Mail,
  MessageCircle,
  Phone,
  ExternalLink,
  Play,
  FileText,
  Video,
  HelpCircle
} from 'lucide-react';

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const faqItems = [
    {
      question: "Wie erstelle ich einen neuen Kurs?",
      answer: "Gehen Sie zum Dashboard und klicken Sie auf 'Neuer Kurs'. Füllen Sie die erforderlichen Informationen aus: Kursname, Fach und Schuljahr. Nach dem Speichern können Sie Schüler hinzufügen und Einstellungen anpassen."
    },
    {
      question: "Wie füge ich Schüler zu einem Kurs hinzu?",
      answer: "Wählen Sie einen Kurs aus und navigieren Sie zu 'Schüler'. Klicken Sie auf 'Schüler hinzufügen' und geben Sie Name und internen Code ein. Sie können auch mehrere Schüler über CSV-Import hinzufügen."
    },
    {
      question: "Was bedeuten die verschiedenen Farben?",
      answer: "Die Farben repräsentieren das Verhalten der Schüler: Blau = Exzellent (80+ XP), Grün = Gut (60-79 XP), Gelb = Warnung (30-59 XP), Rot = Kritisch (unter 30 XP). Diese können in den Kurseinstellungen angepasst werden."
    },
    {
      question: "Wie funktioniert das XP-System?",
      answer: "Schüler sammeln Experience Points (XP) durch positive Aktionen und verlieren sie bei negativem Verhalten. Das Level steigt automatisch alle 100 XP. Sie können Quick Actions verwenden, um schnell XP zu vergeben oder abzuziehen."
    },
    {
      question: "Kann ich Belohnungen und Konsequenzen anpassen?",
      answer: "Ja! Gehen Sie zu den jeweiligen Bereichen in Ihrem Kurs. Sie können eigene Belohnungen mit XP-Kosten erstellen und Konsequenzen mit verschiedenen Schweregraden definieren."
    },
    {
      question: "Wie verwende ich den Tafelmodus?",
      answer: "Der Tafelmodus zeigt alle Schüler in einer großen Übersicht für die Projektion im Klassenzimmer. Klicken Sie auf 'Tafelmodus' in einem Kurs oder verwenden Sie den Vollbildmodus für optimale Sichtbarkeit."
    },
    {
      question: "Wie exportiere ich meine Daten?",
      answer: "In den Einstellungen unter 'Backup' können Sie Ihre Kurse und Schülerdaten exportieren. Reports können als PDF oder Excel-Datei heruntergeladen werden."
    },
    {
      question: "Kann ich mit anderen Lehrkräften zusammenarbeiten?",
      answer: "Ja, Sie können Co-Lehrkräfte zu Ihren Kursen hinzufügen. Diese erhalten dann Zugriff auf die Schülerdaten und können ebenfalls Bewertungen vornehmen."
    }
  ];

  const tutorials = [
    {
      title: "Ersten Kurs erstellen",
      description: "Schritt-für-Schritt Anleitung zur Kurserstellung",
      duration: "5 Min",
      type: "video",
      icon: <Play className="w-4 h-4" />
    },
    {
      title: "Schüler verwalten",
      description: "Schüler hinzufügen, bearbeiten und organisieren",
      duration: "8 Min",
      type: "video",
      icon: <Play className="w-4 h-4" />
    },
    {
      title: "Live Unterricht durchführen",
      description: "Echtzeitbewertung während des Unterrichts",
      duration: "12 Min",
      type: "video",
      icon: <Play className="w-4 h-4" />
    },
    {
      title: "Reports erstellen",
      description: "Berichte generieren und exportieren",
      duration: "6 Min",
      type: "guide",
      icon: <FileText className="w-4 h-4" />
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Hilfe & Support</h1>
        <p className="text-muted-foreground">Finden Sie Antworten und lernen Sie die App kennen</p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suchen Sie nach Hilfe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="tutorials" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Tutorials
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Kontakt
          </TabsTrigger>
        </TabsList>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Häufig gestellte Fragen</CardTitle>
              <CardDescription>
                Antworten auf die wichtigsten Fragen zur Klassenbuch App
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {filteredFAQ.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFAQ.length === 0 && searchTerm && (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Keine Ergebnisse gefunden</h3>
                  <p>Versuchen Sie andere Suchbegriffe oder kontaktieren Sie uns direkt.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tutorials Tab */}
        <TabsContent value="tutorials" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="hover-card cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {tutorial.icon}
                        {tutorial.title}
                      </CardTitle>
                      <CardDescription>{tutorial.description}</CardDescription>
                    </div>
                    <Badge variant="outline">{tutorial.duration}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    {tutorial.type === 'video' ? 'Video ansehen' : 'Anleitung lesen'}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Schülerverwaltung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Schüler hinzufügen und verwalten</li>
                  <li>• CSV-Import für große Klassen</li>
                  <li>• Individuelle Avatars und Codes</li>
                  <li>• Aktivitätsverlauf pro Schüler</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Belohnungssystem
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• XP-basiertes Levelsystem</li>
                  <li>• Anpassbare Belohnungen</li>
                  <li>• Automatische Farbzuordnung</li>
                  <li>• Wöchentliche Limits</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  Live Unterricht
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Echtzeitbewertung</li>
                  <li>• Quick Actions mit Hotkeys</li>
                  <li>• Tafelmodus für Projektion</li>
                  <li>• Mehrfachauswahl von Schülern</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Reports & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Detaillierte Statistiken</li>
                  <li>• Verhaltensverteilung</li>
                  <li>• Zeitliche Entwicklung</li>
                  <li>• Export als PDF/Excel</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Konsequenzen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Verschiedene Schweregrade</li>
                  <li>• Notizen und Dokumentation</li>
                  <li>• Automatische Benachrichtigungen</li>
                  <li>• Elternkommunikation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Anpassungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Individuelle Kurseinstellungen</li>
                  <li>• Anpassbare Farbsysteme</li>
                  <li>• Eigene Quick Actions</li>
                  <li>• Automatische Regeln</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Support kontaktieren</CardTitle>
                <CardDescription>
                  Wir helfen Ihnen gerne bei Fragen oder Problemen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">E-Mail Support</p>
                    <p className="text-sm text-muted-foreground">support@klassenbuch-app.de</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Telefon Support</p>
                    <p className="text-sm text-muted-foreground">+49 (0) 123 456 789</p>
                    <p className="text-xs text-muted-foreground">Mo-Fr 9:00-17:00 Uhr</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Sofortige Hilfe im Chat</p>
                  </div>
                </div>
                
                <Button className="w-full">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat starten
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weitere Ressourcen</CardTitle>
                <CardDescription>
                  Zusätzliche Hilfe und Informationen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Benutzerhandbuch
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  Video-Tutorials
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Community Forum
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Changelog
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Help */}
          <Card>
            <CardHeader>
              <CardTitle>Schnelle Hilfe</CardTitle>
              <CardDescription>
                Häufige Probleme und deren Lösungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">App lädt nicht</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Versuchen Sie den Browser-Cache zu leeren oder verwenden Sie einen anderen Browser.
                  </p>
                  <Button size="sm" variant="outline">Mehr erfahren</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Daten synchronisieren nicht</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Überprüfen Sie Ihre Internetverbindung und aktualisieren Sie die Seite.
                  </p>
                  <Button size="sm" variant="outline">Mehr erfahren</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Passwort vergessen</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Verwenden Sie die "Passwort vergessen" Funktion auf der Login-Seite.
                  </p>
                  <Button size="sm" variant="outline">Mehr erfahren</Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Schüler werden nicht angezeigt</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Stellen Sie sicher, dass die Schüler als "aktiv" markiert sind.
                  </p>
                  <Button size="sm" variant="outline">Mehr erfahren</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}