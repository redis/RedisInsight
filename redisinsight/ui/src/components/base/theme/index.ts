import { createGlobalStyle } from 'styled-components'
import { Theme } from 'uiBase/theme/types'

export const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  :root {
    // spacing
    //2.5px/0.2rem
    --size-xxs: ${({ theme }) => theme.core.space.space025};
    //5px/0.4rem
    --size-xs: ${({ theme }) => theme.core.space.space050};
    //10px/0.8rem
    --size-s: ${({ theme }) => theme.core.space.space100};
    //15px/1.2rem
    --size-m: ${({ theme }) => theme.core.space.space150};
    //25px/2rem
    --size-l: ${({ theme }) => theme.core.space.space250};
    //30px/2.4rem
    --size-xl: ${({ theme }) => theme.core.space.space300};
    //40px/3.2rem
    --size-xxl: ${({ theme }) => theme.core.space.space400};
    //50px/4rem
    --size-xxxl: ${({ theme }) => theme.core.space.space500};
    //60px/4.8rem
    --size-xxxxl: ${({ theme }) => theme.core.space.space600};
    //15px
    --size-base: var(--size-m);

    --border-radius-small: var(--size-xs);
    --border-radius-medium: var(--size-s);
    
    --gap-s: var(--size-s);
    --gap-m: var(--size-m);
    // breakpoints
    // to 574px
    --bp-xs: 0;
    // to 767px
    --bp-s: 575px;
    // to 991px
    --bp-m: 768px;
    // to 1199px
    --bp-l: 992px;
    // above 1200px
    --bp-xl: 1200px;
    
    // colors
    --color-text-default: ${({ theme }) => theme.components.typography.colors.primary};
    --color-text-primary: ${({ theme }) => theme.components.typography.colors.primary};
    --color-text-secondary: ${({ theme }) => theme.components.typography.colors.secondary};
    --color-text-subdued: ${({ theme }) => theme.semantic.color.text.informative400};
    --color-text-informative: ${({ theme }) => theme.semantic.color.text.informative400};
    --color-text-danger: ${({ theme }) => theme.semantic.color.text.danger600};
    --color-text-ghost: ${({ theme }) => theme.semantic.color.text.neutral600};
    --color-text-accent: ${({ theme }) => theme.semantic.color.text.notice600};
    --color-text-warning: ${({ theme }) => theme.semantic.color.text.attention600};
    --color-text-success: ${({ theme }) => theme.semantic.color.text.success600};

    --color-link-primary: ${({ theme }) => theme.semantic.color.text.primary500};
    --color-link-default: ${({ theme }) => theme.semantic.color.text.primary500};
    --color-link-text: ${({ theme }) => theme.semantic.color.text.neutral700};
    
    --color-bg-default: ${({ theme }) => theme.semantic.color.background.neutral100};
    --color-bg-primary: ${({ theme }) => theme.semantic.color.background.neutral100};
    --color-bg-secondary: ${({ theme }) => theme.semantic.color.background.primary100};
    --color-bg-subdued: ${({ theme }) => theme.semantic.color.background.informative400};
    --color-bg-informative: ${({ theme }) => theme.semantic.color.background.informative400};
    --color-bg-danger: ${({ theme }) => theme.semantic.color.background.danger600};
    --color-bg-ghost: ${({ theme }) => theme.semantic.color.background.neutral600};
    --color-bg-accent: ${({ theme }) => theme.semantic.color.background.notice600};
    --color-bg-warning: ${({ theme }) => theme.semantic.color.background.attention600};
    --color-bg-success: ${({ theme }) => theme.semantic.color.background.success600};

    --hrBackgroundColor: ${({ theme }) => theme.semantic.color.background.primary300};
    
  }
`
