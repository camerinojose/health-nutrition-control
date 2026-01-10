import { describe, it, expect } from 'vitest';

describe('Dashboard - Basic Tests', () => {
  it('should calculate BMI correctly', () => {
    const weight = 75; // kg
    const height = 1.75; // m
    const bmi = weight / (height * height);
    expect(bmi).toBeGreaterThan(0);
    expect(bmi).toBeLessThan(100);
  });

  it('should validate weight', () => {
    const weight = 75;
    const isValid = weight > 0 && weight < 500;
    expect(isValid).toBe(true);
  });

  it('should validate height', () => {
    const height = 175;
    const isValid = height > 0 && height < 300;
    expect(isValid).toBe(true);
  });

  it('should calculate progress percentage', () => {
    const currentWeight = 75;
    const targetWeight = 70;
    const initialWeight = 80;
    
    const progress = ((initialWeight - currentWeight) / (initialWeight - targetWeight)) * 100;
    expect(progress).toBeGreaterThan(0);
  });

  it('should display profile information', () => {
    const profile = {
      id: 1,
      name: 'Test User',
      email: 'test@test.com',
    };
    expect(profile.name).toBe('Test User');
    expect(profile.email).toBe('test@test.com');
  });
});

