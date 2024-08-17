import { cl } from '../../src/cl';
import { Mode } from '../../src/cl/constants';
import { CSSModuleClasses } from '../../src/cl/types';

const classes: CSSModuleClasses = {
  class1: 'class1_abc',
  class2: 'class2_cde',
}

const classes2: CSSModuleClasses = {
  class1: 'class1_fgh',
  class2: 'class2_ilm',
}

describe('cl', () => {
  it(`should return "class-1" as class string`, () => {
    expect(cl('class-1')).toBe('class-1');
  });

  it(`should return "class-1 class-2" as class string`, () => {
    expect(cl('class-1', ['class-2'])).toBe('class-1 class-2');
  });

  it(`should return "class-1 class-2 class-3" as class string`, () => {
    expect(cl('class-1', ['class-2', 'class-3'])).toBe(
      'class-1 class-2 class-3'
    );
  });

  it(`should return "class-1 class-2 class-3 class-4" as class string`, () => {
    expect(
      cl('class-1', ['class-2', 'class-3', [{ 'class-5': false }]], {
        'class-4': true
      })
    ).toBe('class-1 class-2 class-3 class-4');
  });

  it(`should return "class-1 class-2 class-3 class-4 class-6" as class string`, () => {
    expect(
      cl('class-1', ['class-2', 'class-3', [{ 'class-5': false }]], {
        'class-4': true,
        'class-6': []
      })
    ).toBe('class-1 class-2 class-3 class-4 class-6');
  });

  it(`should return "class-1 class-2 class-3 class-7 class-4 class-6" as class string`, () => {
    expect(
      cl(
        'class-1',
        ['class-2', 'class-3', [{ 'class-5': false }], 'class-7'],
        {
          'class-4': true,
          'class-6': []
        }
      )
    ).toBe('class-1 class-2 class-3 class-7 class-4 class-6');
  });

  describe('cls no CSSModuleClasses.', () => {
    const cls = cl.setClasses();

    it('cls should return "noModule class".', () => {
      expect(cls('noModule', 'class1', { class2: false })).toBe('noModule class1');
    });
  });

  describe('cls single CSSModuleClasses.', () => {
    const cls = cl.setClasses(classes);

    it('cls should return "noModule class1_abc".', () => {
      expect(cls('noModule', 'class1', { class2: false })).toBe('noModule class1_abc');
    });
  });

  describe('cls multiple CSSModuleClasses "merge" mode.', () => {
    const cls = cl.setClasses([classes, classes2]);

    it('cls should return "noModule class1_abc class1_fgh".', () => {
      expect(cls('noModule', 'class1', { class2: false })).toBe('noModule class1_abc class1_fgh');
    });
  });

  describe('cls multiple CSSModuleClasses "merge" mode, multiple noModule classes.', () => {
    const cls = cl.setClasses([classes, classes2]);

    it('cls should return "noModule class1_abc class1_fgh noModule class2_cde class2_ilm".', () => {
      expect(cls('noModule', 'class1', 'noModule', 'class2')).toBe('noModule class1_abc class1_fgh class2_cde class2_ilm');
    });
  });

  describe('cls multiple CSSModuleClasses "replace" mode.', () => {
    const cls = cl.setClasses([classes, classes2], Mode.replace);

    it('cls should return "noModule class1_fgh".', () => {
      expect(cls('noModule', 'class1', { class2: false })).toBe('noModule class1_fgh');
    });
  });

  describe('cls multiple CSSModuleClasses "replace" mode, multiple noModule classes.', () => {
    const cls = cl.setClasses([classes, classes2], 'replace');

    it('cls should return "noModule class1_fgh noModule class2_ilm".', () => {
      expect(cls('noModule', 'class1', 'class2')).toBe('noModule class1_fgh class2_ilm');
    });
  });
});
