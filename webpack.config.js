const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = (env) => {
  const isDevelopment = env.NODE_ENV === "development";
  const targetBrowser = env.TARGET_BROWSER || "default";

  return {
    mode: isDevelopment ? "development" : "production",
    devtool: isDevelopment ? "source-map" : false,
    entry: {
      "options/options": [
        "./src/options/options.js",
        "./src/options/options.css",
      ],
      "popup/popup": ["./src/popup/popup.js", "./src/popup/popup.css"],
      background: "./src/background.js",
      contentScript: [
        "./src/content/contentScript.js",
        ...(isDevelopment ? ["./src/content/embed.test.js"] : []),
      ],
      styles: "./src/styles.css",
    },
    output: {
      path: path.resolve(__dirname, "dist"),
      filename: "[name].js",
      clean: true,
    },
    cache: {
      type: "filesystem",
    },
    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false,
            },
            compress: {
              drop_console: true,
            },
          },
          extractComments: false,
        }),
        new CssMinimizerPlugin(),
      ],
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
          },
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "postcss-loader"],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "src/options/options.html",
        filename: "options/options.html",
        chunks: ["options"],
        publicPath: "",
      }),
      new HtmlWebpackPlugin({
        template: "src/popup/popup.html",
        filename: "popup/popup.html",
        chunks: ["popup"],
        publicPath: "",
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "node_modules/webextension-polyfill/dist/browser-polyfill.min.js",
            to: "browser-polyfill.min.js",
          },
          ...(targetBrowser === "chrome"
            ? [{ from: "manifest.chrome.json", to: "manifest.json" }]
            : [
                {
                  from: "manifest.json",
                  to: "manifest.json",
                },
              ]),
          { from: "src/assets", to: "assets" },
        ],
      }),
    ],
  };
};
