

import { describe, it, expect, vi, beforeAll } from 'vitest';
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import HealthProfileForm from './HealthProfileForm';
import '../src/i18n';

// Mockear el módulo api para que las llamadas no fallen
vi.mock('./api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: { id: 1 } })),
    put: vi.fn(() => Promise.resolve({ data: { id: 1 } })),
  },
}));


describe('HealthProfileForm', () => {
  beforeAll(() => {
    // Asegura que i18n esté en español
    // eslint-disable-next-line no-undef
    if (globalThis.i18n) globalThis.i18n.changeLanguage('es');
  });

  it('muestra errores si los campos obligatorios están vacíos o inválidos', async () => {
    const { container } = render(<HealthProfileForm onSave={vi.fn()} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Guardar Perfil'));
    await waitFor(() => {
      const errores = ['Edad inválida', 'Campo requerido', 'Altura inválida', 'Peso inválido'];
      errores.forEach(msg => {
        const found = screen.queryByText((content) => content && content.replace(/\s+/g, ' ').includes(msg), { exact: false });
        if (!found) {
          expect(container.textContent).toContain(msg);
        } else {
          expect(found).toBeInTheDocument();
        }
      });
    });
  });

  it('permite guardar si los campos son válidos', async () => {
    const onSave = vi.fn();
    render(<HealthProfileForm onSave={onSave} onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Edad *'), { target: { value: '30' } });
    fireEvent.change(screen.getByLabelText('Sexo *'), { target: { value: 'male' } });
    fireEvent.change(screen.getByLabelText('Altura (cm) *'), { target: { value: '170' } });
    fireEvent.change(screen.getByLabelText('Peso Actual (kg) *'), { target: { value: '70' } });
    fireEvent.click(screen.getByText('Guardar Perfil'));
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });
});
