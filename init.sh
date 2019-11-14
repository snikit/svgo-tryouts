IFS=$'\n'
for file in $(find ./input -type f -name "*.svg");


do

 node index.js "$file"

done;
