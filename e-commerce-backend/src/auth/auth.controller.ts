import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; 

@ApiTags('Autenticación y Clientes') // Categoría en la interfaz de Swagger
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar un nuevo cliente en la tienda' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'El correo ya está en uso o los datos son inválidos.' })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'Iniciar sesión y obtener token JWT (Access Token)' })
  @ApiResponse({ status: 200, description: 'Login exitoso. Devuelve el token JWT.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas (correo o contraseña incorrectos).' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Corregido el error de tipeo (asynclogin -> async login)
    return this.authService.login(loginDto.email, loginDto.password);
  }

  // --- RUTAS PROTEGIDAS ---
  
  @ApiBearerAuth() // Indica en Swagger que requiere el candado JWT
  @ApiOperation({ summary: 'Obtener el perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil recuperado exitosamente gracias al token JWT.' })
  @ApiResponse({ status: 401, description: 'No autorizado. Token inválido o ausente.' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    // Si el JWT es válido, Passport inyecta los datos del usuario en req.user
    return {
      message: 'Acceso autorizado a ruta protegida',
      user: req.user,
    };
  }
}