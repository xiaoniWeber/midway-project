import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
  Query,
  ALL,
  Put,
  Param,
  Del,
} from '@midwayjs/decorator';
import { RoleDTO } from '../dto/role';
import { RoleService } from '../service/role';
import { RoleMenuDTO } from '../dto/role.menu';

@Provide()
@Controller('/role', { description: '角色管理' })
export class RoleController {
  @Inject()
  roleService: RoleService;

  @Post('/', { description: '创建角色' })
  async create(@Body(ALL) data: RoleDTO) {
    return await this.roleService.createRole(data);
  }

  @Put('/', { description: '更新角色' })
  async edit(@Body(ALL) data: RoleDTO) {
    const role = await this.roleService.getById(data.id);
    // update
    return await this.roleService.editRole(role);
  }

  @Del('/:id', { description: '删除' })
  async remove(@Param('id') id: number) {
    const role = await this.roleService.getById(id);
    await this.roleService.removeRole(role);
  }

  @Get('/:id', { description: '根据id查询' })
  async getById(@Param('id') id: number) {
    return await this.roleService.getById(id);
  }

  @Get('/page', { description: '分页查询' })
  async page(@Query('page') page: number, @Query('size') size: number) {
    return await this.roleService.page(page, size);
  }
  @Post('/alloc/menu', { description: '角色分配菜单' })
  async allocMenu(@Body() roleMenuDTO: RoleMenuDTO) {
    return await this.roleService.allocMenu(
      roleMenuDTO.roleId,
      roleMenuDTO.menuIds
    );
  }
  @Get('/list', { description: '获取角色列表' })
  async list() {
    return await this.roleService.list();
  }
  @Get('/menu/list', { description: '根据角色id获取菜单列表' })
  async getMenusByRoleId(@Query('id') id: number) {
    return (await this.roleService.getMenusByRoleId(id)).map(o => o.menuId);
  }
}
