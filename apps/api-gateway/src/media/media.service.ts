import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Readable } from 'stream';
import FormData from 'form-data';
import { MediaDto, TokenPayload } from '@app/common';

@Injectable()
export class MediaService {
  constructor(private readonly httpService: HttpService) {}

  async getFileById(id: string): Promise<unknown> {
    const response = await lastValueFrom(
      this.httpService.get(`/media/get/${id}`),
    );
    return response.data;
  }

  async uploadSingleFile(
    endpoint: string,
    file: Express.Multer.File,
    currentUser: TokenPayload,
  ): Promise<MediaDto> {
    const form = new FormData();
    form.append('file', Readable.from(file.buffer), {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const headers = {
      ...form.getHeaders(),
      'x-current-user': JSON.stringify(currentUser),
    };

    const response$ = this.httpService.post<MediaDto>(
      `/media/${endpoint}`,
      form,
      {
        headers,
      },
    );

    const response = await lastValueFrom(response$);
    return response.data;
  }

  async uploadMultipleFiles(
    endpoint: string,
    files: Express.Multer.File[],
    currentUser: TokenPayload,
  ): Promise<MediaDto[]> {
    const form = new FormData();

    for (const file of files) {
      form.append('files', Readable.from(file.buffer), {
        filename: file.originalname,
        contentType: file.mimetype,
      });
    }

    const headers = {
      ...form.getHeaders(),
      'x-current-user': JSON.stringify(currentUser),
    };

    const response$ = this.httpService.post<MediaDto[]>(
      `/media/${endpoint}`,
      form,
      {
        headers,
      },
    );

    const response = await lastValueFrom(response$);
    return response.data;
  }

  async replaceFile(
    id: string,
    file: Express.Multer.File,
    currentUser: TokenPayload,
  ): Promise<MediaDto> {
    const form = new FormData();

    form.append('file', Readable.from(file.buffer), {
      filename: file.originalname,
      contentType: file.mimetype,
    });

    const headers = {
      ...form.getHeaders(),
      'x-current-user': JSON.stringify(currentUser),
    };

    const response$ = this.httpService.post<MediaDto>(
      `/media/update/${id}`,
      form,
      { headers },
    );

    const response = await lastValueFrom(response$);
    return response.data;
  }

  async deleteFile(id: string, currentUser: TokenPayload): Promise<unknown> {
    const payload = { id, currentUser };

    const response = await lastValueFrom(
      this.httpService.post(`/media/delete/${id}`, payload),
    );
    return response.data;
  }
}
