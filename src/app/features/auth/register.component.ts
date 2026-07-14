import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Colegio {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  protected readonly form;
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly colegios: Colegio[] = [
    { id: '1', nombre: 'Colegio San José' },
    { id: '2', nombre: 'Colegio Santa María' },
    { id: '3', nombre: 'Instituto Técnico Industrial' },
    { id: '4', nombre: 'Liceo Nacional' },
    { id: '5', nombre: 'Centro Educativo Nuevo Horizonte' },
  ];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      colegioId: ['', Validators.required],
    }, { validators: this.passwordsMatch });
  }

  private passwordsMatch(control: AbstractControl): ValidationErrors | null {
    const pass = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return pass && confirm && pass !== confirm ? { passwordsMismatch: true } : null;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    // TODO: Connect to Supabase auth
    const { nombre, email, colegioId } = this.form.getRawValue();
    console.log('Register attempt', { nombre, email, colegioId, rol: 'encargado_convivencia' });
  }

  protected get nombre() { return this.form.controls.nombre; }
  protected get email() { return this.form.controls.email; }
  protected get password() { return this.form.controls.password; }
  protected get confirmPassword() { return this.form.controls.confirmPassword; }
  protected get colegioId() { return this.form.controls.colegioId; }
}
