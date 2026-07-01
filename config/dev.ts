import type { UserConfigExport } from '@tarojs/cli';
export default {
  logger: {
    quiet: false,
    stats: true,
  },
  mini: {},
  h5: {
    devServer: {
      open: false,
      hot: true,
      liveReload: true,
      client: {
        webSocketTransport: 'ws',
        webSocketURL: {
          hostname: 'localhost',
          pathname: '/ws',
          port: 50760,
        },
      },
    },
  },
} satisfies UserConfigExport<'webpack5'>;
