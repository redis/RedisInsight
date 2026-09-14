import { ForbiddenException } from '@nestjs/common';
import {
  getRdiUpstreamPath,
  getRdiUpstreamQuery,
  resolveRdiUpstreamUrl,
} from 'src/modules/rdi/utils/rdi-proxy.util';

const id = 'rdiId';

describe('proxy.util', () => {
  describe('getRdiUpstreamPath', () => {
    it('Should strip RedisInsight prefixes and the proxy mount point', () => {
      expect(
        getRdiUpstreamPath(`/api/rdi/${id}/proxy/api/v1/pipelines`, id),
      ).toEqual('api/v1/pipelines');
    });

    it('Should work behind RI_PROXY_PATH', () => {
      expect(
        getRdiUpstreamPath(`/ri/api/rdi/${id}/proxy/api/v1/pipelines`, id),
      ).toEqual('api/v1/pipelines');
    });

    it('Should drop the query string', () => {
      expect(
        getRdiUpstreamPath(`/api/rdi/${id}/proxy/api/v1/x?a=1&b=2`, id),
      ).toEqual('api/v1/x');
    });

    it('Should leave encoded delimiters encoded', () => {
      expect(
        getRdiUpstreamPath(
          `/api/rdi/${id}/proxy/api/v1/p/foo%2Fbar%3Fx%23y`,
          id,
        ),
      ).toEqual('api/v1/p/foo%2Fbar%3Fx%23y');
    });

    it('Should return an empty path when the proxy root is requested', () => {
      expect(getRdiUpstreamPath(`/api/rdi/${id}/proxy`, id)).toEqual('');
      expect(getRdiUpstreamPath(`/api/rdi/${id}/proxy/`, id)).toEqual('');
    });

    it('Should collapse repeated leading slashes', () => {
      expect(getRdiUpstreamPath(`/api/rdi/${id}/proxy///api/v1/x`, id)).toEqual(
        'api/v1/x',
      );
    });

    it('Should return an empty path when the marker is absent', () => {
      expect(getRdiUpstreamPath('/api/rdi/other/statistics', id)).toEqual('');
    });

    it('Should keep a nested proxy-shaped path in the upstream path', () => {
      expect(
        getRdiUpstreamPath(`/api/rdi/${id}/proxy/api/v1/rdi/${id}/proxy`, id),
      ).toEqual(`api/v1/rdi/${id}/proxy`);
    });
  });

  describe('getRdiUpstreamQuery', () => {
    it('Should return the query string without the leading question mark', () => {
      expect(getRdiUpstreamQuery('/x?a=1&b=2')).toEqual('a=1&b=2');
    });

    it('Should return an empty string when there is no query', () => {
      expect(getRdiUpstreamQuery('/x')).toEqual('');
    });

    it('Should keep a question mark inside the query', () => {
      expect(getRdiUpstreamQuery('/x?a=1&b=on?off')).toEqual('a=1&b=on?off');
    });
  });

  describe('resolveRdiUpstreamUrl', () => {
    it('Should resolve against a base url without a path', () => {
      expect(
        resolveRdiUpstreamUrl('http://localhost:4000', 'api/v1/pipelines').href,
      ).toEqual('http://localhost:4000/api/v1/pipelines');
    });

    it('Should append the query string', () => {
      expect(
        resolveRdiUpstreamUrl('http://localhost:4000', 'api/v1/x', 'a=1&b=2')
          .href,
      ).toEqual('http://localhost:4000/api/v1/x?a=1&b=2');
    });

    it('Should send no query string when none was supplied', () => {
      expect(
        resolveRdiUpstreamUrl('http://localhost:4000', 'api/v1/x').href,
      ).toEqual('http://localhost:4000/api/v1/x');
    });

    it.each([
      'http://localhost:4000',
      'http://localhost:4000/',
      'http://localhost:4000///',
    ])('Should normalize trailing slashes on base url %s', (rdiUrl) => {
      expect(resolveRdiUpstreamUrl(rdiUrl, 'api/v1/x').href).toEqual(
        'http://localhost:4000/api/v1/x',
      );
    });

    it('Should keep an encoded delimiter encoded rather than treating it as a separator', () => {
      expect(
        resolveRdiUpstreamUrl('http://localhost:4000', 'api/v1/p/foo%2Fbar')
          .href,
      ).toEqual('http://localhost:4000/api/v1/p/foo%2Fbar');
    });

    it.each([
      'https://attacker.example/steal',
      'http://attacker.example/steal',
    ])('Should reject the absolute path %s', (path) => {
      expect(() =>
        resolveRdiUpstreamUrl('http://localhost:4000', path),
      ).toThrow(ForbiddenException);
    });

    it('Should not constrain encoded separators when the base url has no path', () => {
      // nothing to escape from: any path on the origin is in scope
      expect(
        resolveRdiUpstreamUrl('http://localhost:4000', '..%2fadmin').href,
      ).toEqual('http://localhost:4000/..%2fadmin');
    });

    it('Should not let a scheme-relative path change the host', () => {
      expect(
        resolveRdiUpstreamUrl(
          'http://localhost:4000',
          '//attacker.example/steal',
        ).host,
      ).toEqual('localhost:4000');
    });

    describe('when the rdi url carries a path of its own', () => {
      const rdiUrl = 'http://localhost:4000/rdi';

      it('Should keep the base path when resolving', () => {
        expect(resolveRdiUpstreamUrl(rdiUrl, 'api/v1/pipelines').href).toEqual(
          'http://localhost:4000/rdi/api/v1/pipelines',
        );
      });

      it('Should allow the base path itself', () => {
        expect(resolveRdiUpstreamUrl(rdiUrl, '').href).toEqual(
          'http://localhost:4000/rdi/',
        );
      });

      it.each([
        '../secret',
        '../../secret',
        'api/../../secret',
        '%2e%2e/secret',
        '%2E%2E/secret',
        '.%2e/secret',
      ])('Should reject the dot-segment escape %s', (path) => {
        expect(() => resolveRdiUpstreamUrl(rdiUrl, path)).toThrow(
          ForbiddenException,
        );
      });

      it('Should reject a sibling path that merely shares the base prefix string', () => {
        // `/rdi-other` starts with `/rdi` as a string but is a different path -
        // comparing against the base pathname *with* its trailing slash is what
        // keeps this out of scope
        expect(() => resolveRdiUpstreamUrl(rdiUrl, '../rdi-other/x')).toThrow(
          ForbiddenException,
        );
      });

      it.each([
        '..%2fsecret',
        '..%2Fsecret',
        '..%5csecret',
        '..%5Csecret',
        'api/..%2f..%2fsecret',
      ])(
        'Should reject the encoded-separator traversal %s, which an upstream that decodes before normalizing would read as an escape',
        (path) => {
          expect(() => resolveRdiUpstreamUrl(rdiUrl, path)).toThrow(
            ForbiddenException,
          );
        },
      );

      it('Should still allow an encoded slash inside a real path segment', () => {
        // decodes to /rdi/api/v1/pipelines/foo/bar, still within the base
        expect(
          resolveRdiUpstreamUrl(rdiUrl, 'api/v1/pipelines/foo%2Fbar').href,
        ).toEqual('http://localhost:4000/rdi/api/v1/pipelines/foo%2Fbar');
      });
    });
  });
});
