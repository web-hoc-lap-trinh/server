import { AppDataSource } from '../../config/data-source';
import { User } from './user.entity';
import { NotFoundError } from '../../utils/apiResponse';

const userRepository = AppDataSource.getRepository(User);

export const getAdminUserList = async (search?: string, sortBy: string = 'newest') => {
  const query = userRepository.createQueryBuilder('user')
    .select([
      'user.user_id',
      'user.full_name',
      'user.avatar_url',
      'user.status',
      'user.created_at',
      'user.last_active'
    ]);

  if (search) {
    query.where('user.full_name LIKE :search', { search: `%${search}%` });
  }

  query.orderBy('user.created_at', sortBy === 'newest' ? 'DESC' : 'ASC');
  return await query.getMany();
};

export const updateUserStatus = async (id: number, status: string) => {
  const user = await userRepository.findOneBy({ user_id: id });
  if (!user) throw new NotFoundError('User không tồn tại');
  user.status = status;
  return await userRepository.save(user);
};

export const deleteUser = async (id: number) => {
  const result = await userRepository.delete(id);
  if (result.affected === 0) throw new NotFoundError('User không tồn tại');
  return true;
};