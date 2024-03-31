CREATE DATABASE IF NOT EXISTS deine_datenbank;
USE deine_datenbank;
 
-- Tabelle UserDaten erstellen
CREATE TABLE IF NOT EXISTS UserDaten (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    RegistrierDatum DATETIME DEFAULT CURRENT_TIMESTAMP,
    Vorname VARCHAR(60) NOT NULL,
    Nachname VARCHAR(60) NOT NULL,
    Adresse VARCHAR(255),
    Plz INT,
    Tel VARCHAR(20),
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255),
    hasCompletedTutorial BOOLEAN DEFAULT false
);
 
-- Tabelle JobDaten erstellen
CREATE TABLE IF NOT EXISTS JobDaten (
    JobID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    Title TEXT,
    Textfeld TEXT,
    Startzeitpunkt DATETIME,
    Endzeitpunkt DATETIME,
    Vorname VARCHAR(60),
    Nachname VARCHAR(60),
    Adresse VARCHAR(255),
    Plz INT,
    Tel VARCHAR(20),
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID)
);
 
 
CREATE TABLE IF NOT EXISTS JobBewerbungen (
    BewerbungID INT AUTO_INCREMENT PRIMARY KEY,
    JobID INT,
    UserID INT,
    Vorname VARCHAR(60),
    Nachname VARCHAR(60),
    Tel VARCHAR(20),
    Email VARCHAR(255),
    Akzeptiert BOOLEAN DEFAULT false,
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID)
);
 
 
CREATE TABLE IF NOT EXISTS LoanDaten (
    LoanID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    Title TEXT,
    Textfeld TEXT,
    Startzeitpunkt DATETIME,
    Endzeitpunkt DATETIME,
    Vorname VARCHAR(60),
    Nachname VARCHAR(60),
    Adresse VARCHAR(255),
    Plz INT,
    Tel VARCHAR(20),
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID)
);
 
CREATE TABLE IF NOT EXISTS LoanBewerbungen (
    BewerbungID INT AUTO_INCREMENT PRIMARY KEY,
    LoanID INT,
    UserID INT,
    Vorname VARCHAR(60),
    Nachname VARCHAR(60),
    Tel VARCHAR(20),
    Email VARCHAR(255),
    Akzeptiert BOOLEAN DEFAULT false,
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID),
    FOREIGN KEY (LoanID) REFERENCES LoanDaten(LoanID)
);
 
CREATE TABLE IF NOT EXISTS EventDaten (
    EventID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    Title TEXT,
    Textfeld TEXT,
    Startzeitpunkt DATETIME,
    Endzeitpunkt DATETIME,
    Vorname VARCHAR(60),
    Nachname VARCHAR(60),
    Adresse VARCHAR(255),
    Plz INT,
    Tel VARCHAR(20),
    JoinedByUserID INT, -- Hier wird die ID des annehmenden Benutzers gespeichert
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID),
    FOREIGN KEY (JoinedByUserID) REFERENCES UserDaten(UserID)
);
 
CREATE TABLE IF NOT EXISTS EventTeilnehmer (
    BewerbungID INT AUTO_INCREMENT PRIMARY KEY,
    EventID INT,
    UserID INT,
    Vorname VARCHAR(60),
    Nachname VARCHAR(60),
    Tel VARCHAR(20),
    Email VARCHAR(255),
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID)
);
 
-- Tabelle Archive erstellen
CREATE TABLE IF NOT EXISTS JobArchive (
    JobArchiveID INT AUTO_INCREMENT PRIMARY KEY,
    JobID Int,
    UserID INT,
    Title TEXT,
    Textfeld TEXT,
    Startzeitpunkt DATETIME,
    Endzeitpunkt DATETIME,
    Vorname VARCHAR(60),
    Nachname VARCHAR(60),
    Adresse VARCHAR(255),
    Plz INT,
    Tel VARCHAR(20),
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID)
);
 
CREATE TABLE IF NOT EXISTS JobBewerbungArchive (
  BewerbungID INT AUTO_INCREMENT PRIMARY KEY,
  JobArchiveID INT,
  UserID INT,
  Vorname VARCHAR(60),
  Nachname VARCHAR(60),
  Tel VARCHAR(20),
  Email VARCHAR(255),
  Akzeptiert BOOLEAN DEFAULT false,
  FOREIGN KEY (UserID) REFERENCES UserDaten(UserID),
  FOREIGN KEY (JobArchiveID) REFERENCES JobArchive(JobArchiveID)
);
 
CREATE TABLE IF NOT EXISTS LoanArchive (
    ArchiveID INT AUTO_INCREMENT PRIMARY KEY,
    LoanID INT,
    UserID INT,
    Title TEXT,
    Textfeld TEXT,
    Startzeitpunkt DATETIME,
    Endzeitpunkt DATETIME,
    Vorname VARCHAR(60),
    Nachname VARCHAR(60),
    Adresse VARCHAR(255),
    Plz INT,
    Tel VARCHAR(20),
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID)
);
 
CREATE TABLE IF NOT EXISTS LoanBewerbungArchive (
    BewerbungID INT AUTO_INCREMENT PRIMARY KEY,
    LoanArchiveID INT,
    UserID INT,
    Vorname VARCHAR(60),
    Nachname VARCHAR(60),
    Tel VARCHAR(20),
    Email VARCHAR(255),
    Akzeptiert BOOLEAN DEFAULT false,
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID),
    FOREIGN KEY (LoanArchiveID) REFERENCES LoanArchive(ArchiveID)
 
);

 
CREATE TABLE IF NOT EXISTS EventArchive (
    ArchiveID INT AUTO_INCREMENT PRIMARY KEY,
    EventID INT,
    UserID INT,
    Title TEXT,
    Textfeld TEXT,
    Startzeitpunkt DATETIME,
    Endzeitpunkt DATETIME,
    Vorname VARCHAR(60),
    Nachname VARCHAR(60),
    Adresse VARCHAR(255),
    Plz INT,
    Tel VARCHAR(20),
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID)
);
 
 
CREATE TABLE IF NOT EXISTS EventTeilnehmerArchive (
    BewerbungID INT AUTO_INCREMENT PRIMARY KEY,
    EventID INT,
    UserID INT,
    Vorname VARCHAR(60),
    Nachname VARCHAR(60),
    Tel VARCHAR(20),
    Email VARCHAR(255),
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID)
);
 