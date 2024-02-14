CREATE DATABASE IF NOT EXISTS deine_datenbank;
USE deine_datenbank;

-- Tabelle UserDaten erstellen
CREATE TABLE IF NOT EXISTS UserDaten (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Vorname VARCHAR(255) NOT NULL,
    Nachname VARCHAR(255) NOT NULL,
    adresse VARCHAR(255),
    plz INT,
    Tel VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Hier wird das gehashte Passwort gespeichert
    cookie VARCHAR(255),
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
    Nachname VARCHAR(255),
    Adresse VARCHAR(255),
    plz INT,
    Tel VARCHAR(20),
    AcceptedByUserID INT, 
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID),
    FOREIGN KEY (AcceptedByUserID) REFERENCES UserDaten(UserID)
);


CREATE TABLE IF NOT EXISTS JobBewerbungen (
    BewerbungID INT AUTO_INCREMENT PRIMARY KEY,
    JobID INT,
    UserID INT,
	AcceptedByUserID INT,
    Vorname VARCHAR(255),
    Nachname VARCHAR(255),
    Tel VARCHAR(20),
    Email VARCHAR(255),
    Akzeptiert BOOLEAN DEFAULT false,
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID),
    FOREIGN KEY (AcceptedByUserID) REFERENCES UserDaten(UserID)
);
CREATE TABLE IF NOT EXISTS EventDaten (
    EventID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    Title TEXT,
    Textfeld TEXT,
    Startzeitpunkt DATETIME,
    Endzeitpunkt DATETIME,
    Adresse VARCHAR(255),
    PLZ INT,
    Tel VARCHAR(20),
    JoinedByUserID INT, -- Hier wird die ID des annehmenden Benutzers gespeichert
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID),
    FOREIGN KEY (JoinedByUserID) REFERENCES UserDaten(UserID)
);

CREATE TABLE IF NOT EXISTS LoanDaten (
    LoanID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    Textfeld TEXT,
    Startzeitpunkt DATETIME,
    Endzeitpunkt DATETIME,
    Nachname VARCHAR(255),
    Adresse VARCHAR(255),
    plz INT,
    Tel VARCHAR(20),
    AcceptedByUserID INT, -- Hier wird die ID des annehmenden Benutzers gespeichert
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID),
    FOREIGN KEY (AcceptedByUserID) REFERENCES UserDaten(UserID)
);

-- Tabelle Archive erstellen
CREATE TABLE IF NOT EXISTS Archive (
    ArchiveID INT AUTO_INCREMENT PRIMARY KEY,
    JobID INT,
    EventID INT,
    LoanID INT,
    UserID INT,
    Textfeld TEXT,
    Startzeitpunkt DATETIME,
    Endzeitpunkt DATETIME,
    Nachname VARCHAR(255),
    Adresse VARCHAR(255),
    plz INT,
    Tel VARCHAR(20),
    FOREIGN KEY (JobID) REFERENCES JobDaten(JobID),
    FOREIGN KEY (UserID) REFERENCES UserDaten(UserID)
);
