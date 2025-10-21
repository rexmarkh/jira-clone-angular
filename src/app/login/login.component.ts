import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: false
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is already authenticated
    // If yes, redirect to board
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = null;

      try {
        const { email, password } = this.loginForm.value;
        
        // TODO: Implement actual login logic with Appwrite
        console.log('Login attempt:', { email, password });
        
        // Simulate login delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // On successful login, redirect to board
        this.router.navigate(['/project/board']);
        
      } catch (error: any) {
        this.error = error.message || 'Login failed. Please try again.';
        console.error('Login error:', error);
      } finally {
        this.loading = false;
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  async onGoogleSignIn(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // TODO: Implement Google OAuth with Appwrite
      console.log('Google Sign-In attempt');
      
      // Simulate Google sign-in delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On successful login, redirect to board
      this.router.navigate(['/project/board']);
      
    } catch (error: any) {
      this.error = error.message || 'Google Sign-In failed. Please try again.';
      console.error('Google Sign-In error:', error);
    } finally {
      this.loading = false;
    }
  }

  async onGitHubSignIn(): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      // TODO: Implement GitHub OAuth with Appwrite
      console.log('GitHub Sign-In attempt');
      
      // Simulate GitHub sign-in delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // On successful login, redirect to board
      this.router.navigate(['/project/board']);
      
    } catch (error: any) {
      this.error = error.message || 'GitHub Sign-In failed. Please try again.';
      console.error('GitHub Sign-In error:', error);
    } finally {
      this.loading = false;
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onForgotPassword(): void {
    // TODO: Implement forgot password functionality
    console.log('Forgot password clicked');
  }

  onCreateAccount(): void {
    // TODO: Navigate to registration page or show registration form
    console.log('Create account clicked');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  // Form validation getters
  get email() { 
    return this.loginForm.get('email'); 
  }

  get password() { 
    return this.loginForm.get('password'); 
  }

  get isEmailInvalid(): boolean {
    return !!(this.email?.invalid && (this.email?.dirty || this.email?.touched));
  }

  get isPasswordInvalid(): boolean {
    return !!(this.password?.invalid && (this.password?.dirty || this.password?.touched));
  }

  get emailErrorMessage(): string {
    if (this.email?.errors?.['required']) {
      return 'Email is required';
    }
    if (this.email?.errors?.['email']) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  get passwordErrorMessage(): string {
    if (this.password?.errors?.['required']) {
      return 'Password is required';
    }
    if (this.password?.errors?.['minlength']) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  }
}