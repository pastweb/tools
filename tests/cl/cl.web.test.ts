import { describe, it, expect } from 'vitest';
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

describe('given the cl utility for class names', () => {
  it(`given a single class string, when cl is called, then it returns the class string unchanged`, () => {
    expect(cl('class-1')).toBe('class-1');
  });

  it(`given a base class and an array with one class, when cl is called, then it returns the concatenated class string`, () => {
    expect(cl('class-1', ['class-2'])).toBe('class-1 class-2');
  });

  it(`given a base class and an array with two classes, when cl is called, then it returns the concatenated class string`, () => {
    expect(cl('class-1', ['class-2', 'class-3'])).toBe(
      'class-1 class-2 class-3'
    );
  });

  it(`given a base class, array, and conditional object, when cl is called, then it returns the concatenated class string including truthy conditionals`, () => {
    expect(
      cl('class-1', ['class-2', 'class-3', [{ 'class-5': false }]], {
        'class-4': true
      })
    ).toBe('class-1 class-2 class-3 class-4');
  });

  it(`given a base class, array, conditional object and array value, when cl is called, then it returns the concatenated class string`, () => {
    expect(
      cl('class-1', ['class-2', 'class-3', [{ 'class-5': false }]], {
        'class-4': true,
        'class-6': []
      })
    ).toBe('class-1 class-2 class-3 class-4 class-6');
  });

  it(`given a base class, array with extra, conditional object and array value, when cl is called, then it returns the concatenated class string`, () => {
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

  describe('given cl.setClasses with no CSS modules', () => {
    const cls = cl.setClasses({});

    it('given cls from setClasses({}), when called with noModule and class1 with falsy conditional, then it returns "noModule class1"', () => {
      expect(cls('noModule', 'class1', { class2: false })).toBe('noModule class1');
    });
  });

  describe('given cl.setClasses with a single CSSModuleClasses', () => {
    const cls = cl.setClasses(classes);

    it('given cls from setClasses with module, when called with noModule and class1 with falsy, then it returns the mapped "noModule class1_abc"', () => {
      expect(cls('noModule', 'class1', { class2: false })).toBe('noModule class1_abc');
    });
  });

  describe('given cl.setClasses with multiple CSSModuleClasses in merge mode', () => {
    const cls = cl.setClasses([classes, classes2]);

    it('given cls from multiple modules in merge, when called with noModule and class1 with falsy, then it returns merged mapped classes "noModule class1_abc class1_fgh"', () => {
      expect(cls('noModule', 'class1', { class2: false })).toBe('noModule class1_abc class1_fgh');
    });
  });

  describe('given cl.setClasses with multiple CSSModuleClasses in merge mode and multiple noModule classes', () => {
    const cls = cl.setClasses([classes, classes2]);

    it('given cls from multiple modules merge and multiple noModule inputs, when called, then it returns the concatenated mapped result', () => {
      expect(cls('noModule', 'class1', 'noModule', 'class2')).toBe('noModule class1_abc class1_fgh class2_cde class2_ilm');
    });
  });

  describe('given cl.setClasses with multiple CSSModuleClasses in replace mode', () => {
    const cls = cl.setClasses([classes, classes2], Mode.replace);

    it('given cls from multiple modules in replace mode, when called with noModule and class1 with falsy, then it returns the replaced mapped class "noModule class1_fgh"', () => {
      expect(cls('noModule', 'class1', { class2: false })).toBe('noModule class1_fgh');
    });
  });

  describe('given cl.setClasses with multiple CSSModuleClasses in replace mode and multiple noModule classes', () => {
    const cls = cl.setClasses([classes, classes2], 'replace');

    it('given cls from multiple modules in replace and multiple noModule, when called, then it returns the concatenated result with replaced mappings', () => {
      expect(cls('noModule', 'class1', 'class2')).toBe('noModule class1_fgh class2_ilm');
    });
  });
});
