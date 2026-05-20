import { jest } from '@jest/globals';

export const auth0 = {
  getSession: jest.fn(),
  logout: jest.fn(),
  login: jest.fn(),
  handleCallback: jest.fn(),
  getAccessToken: jest.fn(),
};

export default auth0;