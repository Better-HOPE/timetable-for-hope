npm run build:builtin

mkdir -p ./build

rm -rf ./build/www

cp -r ./www ./build/www

cp -r ./build/builtin ./build/www/dist
