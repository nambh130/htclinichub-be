import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Readable } from 'stream';
import FormData from 'form-data';
import { MEDIA_SERVICE, MediaDto, TokenPayload } from '@app/common';

@Injectable()
export class MediaService {
  constructor(
    @Inject(MEDIA_SERVICE) private readonly mediaService: HttpService,
  ) {}

  async getFileById(id: string | null | undefined): Promise<unknown> {
    if (!id) return null;

    const response = await lastValueFrom(
      this.mediaService.get(`/media/get/${id}`),
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

    const response$ = this.mediaService.post<MediaDto>(
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

    const response$ = this.mediaService.post<MediaDto[]>(
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

    const response$ = this.mediaService.post<MediaDto>(
      `/media/update/${id}`,
      form,
      { headers },
    );

    const response = await lastValueFrom(response$);
    return response.data;
  }

  async deleteFile(id: string, currentUser: TokenPayload): Promise<unknown> {
    const response = await lastValueFrom(
      this.mediaService.post(
        `/media/delete/${id}`,
        {}, // body can be empty
        {
          headers: {
            'x-current-user': JSON.stringify(currentUser),
          },
        },
      ),
    );
    return response.data;
  }
}
