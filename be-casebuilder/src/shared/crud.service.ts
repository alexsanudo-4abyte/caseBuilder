import { NotFoundException } from '@nestjs/common';
import { Repository, FindOptionsWhere, FindOptionsOrder } from 'typeorm';

export abstract class CrudService<T extends { id: string }> {
  constructor(protected readonly repo: Repository<T>) {}

  private parseSort(sortStr?: string): FindOptionsOrder<T> {
    if (!sortStr) return {} as FindOptionsOrder<T>;
    const field = sortStr.startsWith('-') ? sortStr.slice(1) : sortStr;
    const direction = sortStr.startsWith('-')
      ? ('DESC' as const)
      : ('ASC' as const);
    return { [field]: direction } as FindOptionsOrder<T>;
  }

  list(sort?: string, limit?: number): Promise<T[]> {
    return this.repo.find({
      order: this.parseSort(sort),
      take: limit ?? 1000,
    });
  }

  filter(
    where: FindOptionsWhere<T>,
    sort?: string,
    limit?: number,
  ): Promise<T[]> {
    return this.repo.find({
      where,
      order: this.parseSort(sort),
      take: limit ?? 1000,
    });
  }

  async get(id: string): Promise<T> {
    const entity = await this.repo.findOneBy({ id } as FindOptionsWhere<T>);
    if (!entity) throw new NotFoundException();
    return entity;
  }

  create(data: Partial<T>): Promise<T> {
    const entity = this.repo.create(data as T);
    return this.repo.save(entity);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    await this.repo.update(id, data as any);
    return this.get(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
