import {
  CreateNavigationDTO,
  NavigationRepository,
  UpdateNavigationDTO,
} from './navigation.repository';

export const SYSTEM_MENUS: CreateNavigationDTO[] = [
  {
    type: 'MAIN_LINK',
    label: 'Home',
    href: '/',
    displayOrder: 1,
    isSystem: true,
    isMegaMenu: false,
    isActive: true,
  },
  {
    type: 'MAIN_LINK',
    label: 'Shop',
    href: '/shop',
    displayOrder: 2,
    isSystem: true,
    isMegaMenu: true,
    isActive: true,
  },
  {
    type: 'MAIN_LINK',
    label: 'About',
    href: '/about',
    displayOrder: 3,
    isSystem: true,
    isMegaMenu: false,
    isActive: true,
  },
  {
    type: 'MAIN_LINK',
    label: 'Contact',
    href: '/contact',
    displayOrder: 4,
    isSystem: true,
    isMegaMenu: false,
    isActive: true,
  },
];

export class NavigationService {
  private repo: NavigationRepository;

  constructor(repo: NavigationRepository) {
    this.repo = repo;
  }

  async initSystemNavigations() {
    return await this.repo.initSystemNavigations(SYSTEM_MENUS);
  }

  async getMegaMenuData() {
    return await this.repo.getMegaMenuData();
  }

  async createNavigation(data: CreateNavigationDTO) {
    return await this.repo.create(data);
  }

  async getAllNavigations() {
    return await this.repo.getAll();
  }

  async getNavigationTree() {
    return await this.repo.getTree();
  }

  async getNavigationById(id: string) {
    const nav = await this.repo.getById(id);
    if (!nav) throw new Error('Navigation not found');
    return nav;
  }

  async updateNavigation(id: string, data: UpdateNavigationDTO) {
    const nav = await this.repo.getById(id);
    if (!nav) throw new Error('Navigation not found');

    return await this.repo.update(id, data);
  }

  async deleteNavigation(id: string) {
    const nav = await this.repo.getById(id);
    if (!nav) throw new Error('Navigation not found');
    if (nav.isSystem) throw new Error('Cannot delete a system navigation menu');

    return await this.repo.delete(id);
  }
}
