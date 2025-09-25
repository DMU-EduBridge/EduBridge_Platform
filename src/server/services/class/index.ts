import { ClassAssignmentService } from './class-assignment.service';
import { ClassCrudService } from './class-crud.service';
import { ClassMemberService } from './class-member.service';
import { ClassStatsService } from './class-stats.service';

/**
 * 통합 클래스 서비스
 * 모든 클래스 관련 기능을 하나의 인터페이스로 제공
 */
export class ClassService {
  public readonly crud: ClassCrudService;
  public readonly members: ClassMemberService;
  public readonly assignments: ClassAssignmentService;
  public readonly stats: ClassStatsService;

  constructor() {
    this.crud = new ClassCrudService();
    this.members = new ClassMemberService();
    this.assignments = new ClassAssignmentService();
    this.stats = new ClassStatsService();
  }

  // 편의 메서드들 - 기존 API와의 호환성을 위해 유지
  async getClasses(params: any) {
    return this.crud.getClasses(params);
  }

  async getClassById(id: string) {
    return this.crud.getClassById(id);
  }

  async createClass(data: any, createdBy: string) {
    return this.crud.createClass(data, createdBy);
  }

  async updateClass(id: string, data: any) {
    return this.crud.updateClass(id, data);
  }

  async deleteClass(id: string) {
    return this.crud.deleteClass(id);
  }

  async getClassMembers(params: any) {
    return this.members.getClassMembers(params);
  }

  async addClassMember(data: any) {
    return this.members.addClassMember(data);
  }

  async updateClassMember(id: string, data: any) {
    return this.members.updateClassMember(id, data);
  }

  async removeClassMember(id: string) {
    return this.members.removeClassMember(id);
  }

  async getProblemAssignments(params: any) {
    return this.assignments.getProblemAssignments(params);
  }

  async assignProblem(data: any, assignedBy: string) {
    return this.assignments.assignProblem(data, assignedBy);
  }

  async updateProblemAssignment(id: string, data: any) {
    return this.assignments.updateProblemAssignment(id, data);
  }

  async removeProblemAssignment(id: string) {
    return this.assignments.removeProblemAssignment(id);
  }

  async getClassStats(classId: string) {
    return this.stats.getClassStats(classId);
  }

  async getUserClasses(userId: string, role?: string) {
    return this.stats.getUserClasses(userId, role);
  }

  async getStudentPerformanceInClass(classId: string) {
    return this.stats.getStudentPerformanceInClass(classId);
  }
}

// 기본 인스턴스 생성 및 export
export const classService = new ClassService();

// 개별 서비스들도 export (필요시 직접 사용 가능)
export { ClassAssignmentService } from './class-assignment.service';
export { ClassCrudService } from './class-crud.service';
export { ClassMemberService } from './class-member.service';
export { ClassStatsService } from './class-stats.service';
