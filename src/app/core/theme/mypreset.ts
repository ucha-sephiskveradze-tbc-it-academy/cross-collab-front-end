import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{black.50}',
      100: '{black.100}',
      200: '{black.200}',
      300: '{black.300}',
      400: '{black.400}',
      500: '{black.500}', // base color
      600: '{black.600}',
      700: '{black.700}',
      800: '{black.800}',
      900: '{black.900}',
      950: '{black.950}',
    },

    colorScheme: {
      light: {
        checkbox: {
          background: '{primary.color}',
          borderColor: '{primary.color}',
          iconColor: 'var(--surface)',

          hoverBackground: '{primary.color}',
          hoverBorderColor: '{primary.color}',

          focusBackground: '{primary.color}',
          focusBorderColor: '{primary.color}',
        },

        formField: {
          focusBorderColor: '{primary.color}',
        },
      },

      dark: {
        checkbox: {
          background: '{primary.color}',
          borderColor: '{primary.color}',
          iconColor: 'var(--surface)',

          hoverBackground: '{primary.color}',
          hoverBorderColor: '{primary.color}',

          focusBackground: '{primary.color}',
          focusBorderColor: '{primary.color}',
        },

        formField: {
          focusBorderColor: '{primary.color}',
        },
      },
    },
  },
});

export default MyPreset;
