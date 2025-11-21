import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[^@]+$/, {
    message: 'Discord username cannot contain @ symbol',
  })
  discordUsername: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

