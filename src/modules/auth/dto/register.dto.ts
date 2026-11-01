import { IsEmail, IsString } from 'class-validator'

export class AuthorizeDto {
	@IsEmail()
	email: string

	@IsString()
	password: string
}