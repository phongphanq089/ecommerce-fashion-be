import { SettingRepository } from './setting.repository';
import {
  HeroBannerSchema,
  LogoSchemaType,
  HomepageSectionsSchemaType,
} from './setting.validation';

const HERO_BANNER_KEY = 'HERO_BANNER';
const LOGO_KEY = 'LOGO';
const HOMEPAGE_SECTIONS_KEY = 'HOMEPAGE_SECTIONS';

export class SettingService {
  private repo: SettingRepository;

  constructor(repo: SettingRepository) {
    this.repo = repo;
  }

  async getHeroBanner() {
    const setting = await this.repo.getSettingByKey(HERO_BANNER_KEY);
    return setting ? setting.value : null;
  }

  async upsertHeroBanner(data: HeroBannerSchema) {
    return await this.repo.upsertSetting(HERO_BANNER_KEY, data);
  }

  async getLogo() {
    const setting = await this.repo.getSettingByKey(LOGO_KEY);
    return setting ? setting.value : null;
  }

  async upsertLogo(data: LogoSchemaType) {
    return await this.repo.upsertSetting(LOGO_KEY, data);
  }

  async getHomepageSections() {
    const setting = await this.repo.getSettingByKey(HOMEPAGE_SECTIONS_KEY);
    return setting
      ? setting.value
      : { showNewArrivals: true, showFlashSales: true };
  }

  async upsertHomepageSections(data: HomepageSectionsSchemaType) {
    return await this.repo.upsertSetting(HOMEPAGE_SECTIONS_KEY, data);
  }
}
