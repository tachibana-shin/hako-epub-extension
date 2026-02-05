import antfu from "@antfu/eslint-config"

export default antfu({
  rules: {
    "style/quotes": "off",
    "no-console": "off",
    "style/comma-dangle": "off",
    "style/operator-linebreak": "off",
    "antfu/if-newline": "off",
    "style/arrow-parens": "off",
    "style/brace-style": "off"
  }
})
