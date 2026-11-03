// // src/controller/member.controller.ts 전체 코드
// import {
//   Body,
//   Controller,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Param,
//   Post,
// } from '@nestjs/common';
// import { CreateMemberDto } from '../dto/create-member.dto';
// import { MemberService } from '../service/member.service';
// import { ConflictException } from '@nestjs/common';
// import * as bcrypt from 'bcrypt';
// import { CreateMemberDto } from '../dto/create-member.dto';

// @Controller('members')
// export class MemberController {
//   constructor(private readonly memberService: MemberService) {}

//   @Get('nickname/:nickname')
//   checkNickname(@Param('nickname') nickname: string) {
//     return this.memberService.checkNickname(nickname);
//   }

//   @Get('email/:email')
//   checkEmail(@Param('email') email: string) {
//     return this.memberService.checkEmail(email);
//   }

//   @Post()
//   @HttpCode(HttpStatus.CREATED)
//   async signUp(@Body() dto: CreateMemberDto) {
//     const result = await this.memberService.signUp(dto);
//     return {
//       isSuccess: true,
//       code: 'COMMON201',
//       message: '회원가입에 성공했습니다.',
//       result,
//     };
//   }

//   // src/service/member.service.ts 에 아래 메서드를 추가합니다
//   async signUp(dto: CreateMemberDto) {
//     const existingEmail = await this.memberRepository.findOneBy({
//       email: dto.email,
//     });
//     if (existingEmail) {
//       throw new ConflictException('이미 사용 중인 이메일입니다.');
//     }

//     const existingNickname = await this.memberRepository.findOneBy({
//       nickname: dto.nickname,
//     });
//     if (existingNickname) {
//       throw new ConflictException('이미 사용 중인 닉네임입니다.');
//     }

//     const savedMember = await this.memberRepository.save(
//       this.memberRepository.create({
//         email: dto.email,
//         password: await bcrypt.hash(dto.password, 10),
//         nickname: dto.nickname,
//       }),
//     );

//     return {
//       memberId: savedMember.memberId,
//       email: savedMember.email,
//       nickname: savedMember.nickname,
//     };
//   }
// }

import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Member } from '../entity/member.entity';
import { CreateMemberDto } from '../dto/create-member.dto';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async checkNickname(nickname: string) {
    const member = await this.memberRepository.findOneBy({
      nickname,
    });

    return {
      isAvailable: member === null,
    };
  }

  async checkEmail(email: string) {
    const member = await this.memberRepository.findOneBy({
      email,
    });

    return {
      isAvailable: member === null,
    };
  }

  async signUp(dto: CreateMemberDto) {
    const existingEmail = await this.memberRepository.findOneBy({
      email: dto.email,
    });

    if (existingEmail) {
      throw new ConflictException('이미 사용 중인 이메일입니다.');
    }

    const existingNickname = await this.memberRepository.findOneBy({
      nickname: dto.nickname,
    });

    if (existingNickname) {
      throw new ConflictException('이미 사용 중인 닉네임입니다.');
    }

    const savedMember = await this.memberRepository.save(
      this.memberRepository.create({
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
        nickname: dto.nickname,
      }),
    );

    return {
      memberId: savedMember.memberId,
      email: savedMember.email,
      nickname: savedMember.nickname,
    };
  }
}
