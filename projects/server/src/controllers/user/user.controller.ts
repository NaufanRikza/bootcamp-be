import UserService from '../../service/users/user.service';
import { HttpStatusCode } from 'axios';
import { ProcessError } from '../../helper/Error/errorHandler';
import { BadRequestException } from '../../helper/Error/BadRequestException/BadRequestException';
import { UserAttributes, UserCreationAttributes } from '../../database/models/user.model';
import { Request, Response } from 'express';
import { ICheckEmail, IMailerResponse, IResponse, IUserBodyReq } from '../interface';
import { messages } from '../../config/message';
import generateReferral from '../../helper/function/generatReferral';
import bcrypt from 'bcrypt';
import { NotFoundException } from '../../helper/Error/NotFound/NotFoundException';
import MailerService from '../../service/nodemailer.service';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export class UserController {
  private userServices: UserService;

  constructor() {
    this.userServices = new UserService();
  }

  async read(req: Request, res: Response<IResponse<UserAttributes>>) {
    try {
      const id = Number(req.params.id);
      if (!id) throw new BadRequestException('Invalid id', {});
      const user = await this.userServices.getById(id);

      res.status(HttpStatusCode.Ok).send({
        statusCode: HttpStatusCode.Ok,
        message: messages.SUCCESS,
        data: user ?? {},
      });
      // res.json(userObject);
    } catch (err) {
      ProcessError(err, res);
    }
  }

  async create(req: Request, res: Response<IResponse<UserAttributes>>) {
    try {
      // await validate(postUserValidator, req.body);
      console.log(req.body);
      const attr: IUserBodyReq = req.body;
      const hashedPass = await bcrypt.hash(attr.password, 10);
      attr.password = hashedPass;
      let referralCode = '';
      let userRefferal = {};
      while (userRefferal) {
        try {
          referralCode = generateReferral(6);
          userRefferal = await this.userServices.findOne({ referralCode: referralCode });
        } catch (e) {
          break;
        }
      }

      const newUserAttr: UserCreationAttributes = {
        ...attr,
        referralCode,
        isDeleted: false,
        isVerified: false,
        birthdate: null,
        resetPasswordToken: null,
        verifyToken: null,
      };

      const user = await this.userServices.create(newUserAttr);

      res.status(HttpStatusCode.Ok).send({
        statusCode: HttpStatusCode.Ok,
        message: 'User has been created succesfully',
        data: user ?? {},
      });
    } catch (err) {
      ProcessError(err, res);
    }
  }

  async findUserByEmail(req: Request, res: Response<IResponse<ICheckEmail>>) {
    try {
      const email = req.query.email;
      const user = await this.userServices.findOne({ email: email as string });
      console.log(user.toJSON());
      res.status(HttpStatusCode.Ok).send({
        statusCode: HttpStatusCode.Ok,
        message: 'Email is already in use',
        data: {
          available: false,
        },
      });
    } catch (err: any) {
      if (err instanceof NotFoundException) {
        return res.status(HttpStatusCode.Ok).send({
          statusCode: HttpStatusCode.Ok,
          message: 'Email is available',
          data: {
            available: true,
          },
        });
      }
      ProcessError(err, res);
    }
  }

  async sendEmail(req: Request, res: Response<IResponse<IMailerResponse>>) {
    try {
      const email = req.query.email as string;
      const name = req.query.email as string;
      const emailService = new MailerService();
      const info: SMTPTransport.SentMessageInfo = await emailService.sendEmail(email, name);
      console.log(info.accepted);
      res.status(HttpStatusCode.Ok).send({
        statusCode: HttpStatusCode.Ok,
        message: 'Email was successfully sent',
        data: {
          to: email,
          message: info.response,
          status: 'sent',
        },
      });
    } catch (e: any) {
      ProcessError(e, res);
    }
  }



  // async delete(req: Request, res: Response) {
  //   try {
  //     const id = Number(req.params.id);
  //     if (!id) throw new BadRequestException('Invalid id', {});
  //     const affectedRows = await this.userServices.deleteById(id);
  //     res.status(HttpStatusCode.Ok).json({
  //       affectedRows: affectedRows || 0,
  //     });
  //   } catch (err) {
  //     ProcessError(err, res);
  //   }
  // }
}
