const request = require('supertest');
const { startServer, closeServer } = require('./index');
const connection = require('./db');

let server;

beforeAll(async () => {
  const { server: serverInstance, port } = await startServer(3000);
  server = serverInstance;
});

afterAll(async () => {
  await closeServer(server);
  await new Promise((resolve, reject) => {
    connection.end((err) => {
      if (err) {
        console.error('Fehler beim Schließen der Datenbankverbindung:', err);
        reject(err);
      } else {
        console.log('Datenbankverbindung erfolgreich geschlossen');
        resolve();
      }
    });
  });
});

describe('Benutzerregistrierung und -anmeldung', () => {
  it('sollte einen neuen Benutzer registrieren', async () => {
    const res = await request(server)
      .post('/benutzer/registrieren')
      .send({
        Vorname: 'Max',
        Nachname: 'Mustermann',
        Email: 'test@example.com',
        Passwort: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.erfolg).toBe(true);
  });

  it('sollte den Benutzer anmelden', async () => {
    const res = await request(server)
      .post('/benutzer/anmelden')
      .send({
        Email: 'test@example.com',
        Passwort: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.erfolg).toBe(true);
    expect(res.body.token).toBeDefined();
  });
});

describe('Erstellung, Bewerbung und Verwaltung von Jobs', () => {
  it('sollte einen neuen Job erstellen', async () => {
    const res = await request(server)
      .post('/jobs/erstellen')
      .set('Cookie', 'jwt=mock_token')
      .send({
        UserID: 1,
        Titel: 'Testjob',
        Textfeld: 'Dies ist ein Testjob',
        Startzeitpunkt: '2023-06-01 09:00:00',
        Endzeitpunkt: '2023-06-30 17:00:00',
        Vorname: 'Job',
        Nachname: 'Besitzer',
        Adresse: 'Testadresse',
        PLZ: '12345',
        Telefon: '1234567890'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.erfolg).toBe(true);
  });

  it('sollte sich auf den Job bewerben', async () => {
    const res = await request(server)
      .post('/jobs/mich/bewerben/1')
      .set('Cookie', 'jwt=mock_token')
      .send({
        UserID: 2,
        Vorname: 'Job',
        Nachname: 'Bewerber',
        Telefon: '0987654321',
        Email: 'bewerber@example.com'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.erfolg).toBe(true);
  });

  it('sollte den Bewerber annehmen', async () => {
    const res = await request(server)
      .post('/jobs/1/annehmen')
      .set('Cookie', 'jwt=mock_token')
      .send({
        bewerbungID: 1
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.erfolg).toBe(true);
  });

  it('sollte den Job aktualisieren', async () => {
    const res = await request(server)
      .patch('/jobs/1')
      .set('Cookie', 'jwt=mock_token')
      .send({
        Titel: 'Aktualisierter Testjob',
        Textfeld: 'Dies ist ein aktualisierter Testjob'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.erfolg).toBe(true);
  });

  it('sollte den Job löschen', async () => {
    const res = await request(server)
      .delete('/jobs/1')
      .set('Cookie', 'jwt=mock_token');

    expect(res.statusCode).toEqual(200);
    expect(res.body.erfolg).toBe(true);
  });
});

describe('Benutzerprofilverwaltung', () => {
  it('sollte das Benutzerprofil aktualisieren', async () => {
    const res = await request(server)
      .patch('/benutzer/1')
      .set('Cookie', 'jwt=mock_token')
      .send({
        Vorname: 'Aktualisiert',
        Nachname: 'Benutzer',
        Adresse: 'Aktualisierte Adresse',
        PLZ: '54321',
        Telefon: '9876543210'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.erfolg).toBe(true);
  });

  it('sollte das Benutzerpasswort ändern', async () => {
    const res = await request(server)
      .patch('/benutzer/passwort-ändern')
      .set('Cookie', 'jwt=mock_token')
      .send({
        Email: 'testbenutzer@example.com',
        AltesPasswort: 'password123',
        NeuesPasswort: 'newpassword456'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.erfolg).toBe(true);
  });
});