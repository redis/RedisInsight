// import { theme } from '@redis-ui/styles'
// todo: after integration with redis-ui, override the theme here
import { createGlobalStyle } from 'styled-components'
import { Theme } from 'uiBase/theme/types'

export const GlobalStyle = createGlobalStyle`
  :root {
    //2.5px/0.2rem
    --size-xxs: ${({ theme }: { theme: Theme }) => theme.core.space.space025};
    //5px/0.4rem
    --size-xs: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
    //10px/0.8rem
    --size-s: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
    //15px/1.2rem
    --size-m: ${({ theme }: { theme: Theme }) => theme.core.space.space150};
    //25px/2rem
    --size-l: ${({ theme }: { theme: Theme }) => theme.core.space.space250};
    //30px/2.4rem
    --size-xl: ${({ theme }: { theme: Theme }) => theme.core.space.space300};
    //40px/3.2rem
    --size-xxl: ${({ theme }: { theme: Theme }) => theme.core.space.space400};
    //50px/4rem
    --size-xxxl: ${({ theme }: { theme: Theme }) => theme.core.space.space500};
    //60px/4.8rem
    --size-xxxxl: ${({ theme }: { theme: Theme }) => theme.core.space.space600};
    //15px
    --size-base: var(--size-m);

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
  }
`
