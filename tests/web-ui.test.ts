import request from 'supertest';
import { app } from '../src/app.js';

describe('Web UI', () => {
  it('serves the main HTML page', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/html/);
    expect(response.text).toContain('Equipment Maintenance');
  });

  it('serves the main JavaScript module', async () => {
    const response = await request(app).get('/js/app.js');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/javascript/);
    expect(response.text).toContain('initEquipment');
    expect(response.text).toContain('initRequests');
  });

  it('serves the stylesheet', async () => {
    const response = await request(app).get('/styles.css');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/text\/css/);
    expect(response.text).toContain(':root');
  });
});