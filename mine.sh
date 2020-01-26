IFS=$'\n'




for file in $(find ./input -type f -name "*.svg");


do
echo "processing file : $file";

node mine.js "$file" "$1";

done;
