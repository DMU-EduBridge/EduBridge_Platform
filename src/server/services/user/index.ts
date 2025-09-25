import { UserAuthService } from './user-auth.service';
import { UserCrudService } from './user-crud.service';
import { UserProfileService } from './user-profile.service';

/**
 * 통합 사용자 서비스
 * 모든 사용자 관련 기능을 하나의 인터페이스로 제공
 */
export class UserService {
  public readonly crud: UserCrudService;
  public readonly auth: UserAuthService;
  public readonly profile: UserProfileService;

  constructor() {
    this.crud = new UserCrudService();
    this.auth = new UserAuthService();
    this.profile = new UserProfileService();
  }

  // 편의 메서드들 - 기존 API와의 호환성을 위해 유지
  async getUserById(id: string) {
    return this.crud.getUserById(id);
  }

  async getUserByEmail(email: string) {
    return this.crud.getUserByEmail(email);
  }

  async getUsers(params: any) {
    return this.crud.getUsers(params);
  }

  async createUser(data: any) {
    return this.crud.createUser(data);
  }

  async updateUser(id: string, data: any) {
    return this.crud.updateUser(id, data);
  }

  async deleteUser(id: string) {
    return this.crud.deleteUser(id);
  }

  async getUserStats() {
    return this.crud.getUserStats();
  }

  async getUsersByRole(role: any) {
    return this.profile.getUsersByRole(role);
  }

  async getUsersBySubject(subject: string) {
    return this.profile.getUsersBySubject(subject);
  }

  async searchUsers(query: string) {
    return this.profile.searchUsers(query);
  }

  async updateLastLogin(id: string) {
    return this.auth.updateLastLogin(id);
  }

  async setPasswordResetToken(email: string, token: string, expires: Date) {
    return this.auth.setPasswordResetToken(email, token, expires);
  }

  async clearPasswordResetToken(email: string) {
    return this.auth.clearPasswordResetToken(email);
  }
}

// 기본 인스턴스 생성 및 export
export const userService = new UserService();

// 개별 서비스들도 export (필요시 직접 사용 가능)
export { UserAuthService } from './user-auth.service';
export { UserCrudService } from './user-crud.service';
export { UserProfileService } from './user-profile.service';
