const config = {
  plugins: {
    '@csstools/postcss-global-data': {
      files: ['./src/shared/styles/tokens/breakpoints.css']
    },
    'postcss-custom-media': {}
  }
}

export default config
