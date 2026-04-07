import { Extension } from '@tiptap/core';

const FONT_SIZE_REGEX = /^(\d+(?:\.\d+)?)(px|pt|rem|em|%)$/i;

const FontSize = Extension.create({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => {
              const fontSize = element.style.fontSize;
              if (!fontSize) return null;
              return FONT_SIZE_REGEX.test(fontSize.trim()) ? fontSize.trim() : null;
            },
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          if (!fontSize || !FONT_SIZE_REGEX.test(String(fontSize).trim())) {
            return false;
          }

          return chain().setMark('textStyle', { fontSize: String(fontSize).trim() }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

export default FontSize;
