import {
    createDefaultModule, createDefaultSharedModule, DefaultSharedModuleContext, inject,
    LangiumServices, LangiumSharedServices, Module, PartialLangiumServices
} from 'langium';
import { MiniLogoGeneratedModule, MiniLogoGeneratedSharedModule } from './generated/module';
import { MiniLogoValidationRegistry, MiniLogoValidator } from './minilogo-validator';

/**
 * Declaration of custom services - add your own service classes here.
 */
export type MiniLogoAddedServices = {
    validation: {
        MiniLogoValidator: MiniLogoValidator
    }
}

/**
 * Union of Langium default services and your custom services - use this as constructor parameter
 * of custom service classes.
 */
export type MiniLogoServices = LangiumServices & MiniLogoAddedServices

/**
 * Dependency injection module that overrides Langium default services and contributes the
 * declared custom services. The Langium defaults can be partially specified to override only
 * selected services, while the custom services must be fully specified.
 */
export const MiniLogoModule: Module<MiniLogoServices, PartialLangiumServices & MiniLogoAddedServices> = {
    validation: {
        ValidationRegistry: (services) => new MiniLogoValidationRegistry(services),
        MiniLogoValidator: () => new MiniLogoValidator()
    }
};

/**
 * Create the full set of services required by Langium.
 *
 * First inject the shared services by merging two modules:
 *  - Langium default shared services
 *  - Services generated by langium-cli
 *
 * Then inject the language-specific services by merging three modules:
 *  - Langium default language-specific services
 *  - Services generated by langium-cli
 *  - Services specified in this file
 *
 * @param context Optional module context with the LSP connection
 * @returns An object wrapping the shared services and the language-specific services
 */
export function createMiniLogoServices(context?: DefaultSharedModuleContext): {
    shared: LangiumSharedServices,
    MiniLogo: MiniLogoServices
} {
    const shared = inject(
        createDefaultSharedModule(context),
        MiniLogoGeneratedSharedModule
    );
    const MiniLogo = inject(
        createDefaultModule({ shared }),
        MiniLogoGeneratedModule,
        MiniLogoModule
    );
    shared.ServiceRegistry.register(MiniLogo);
    return { shared, MiniLogo };
}