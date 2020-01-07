IFS=$'\n'
for file in $(find ./input -type f -name "*.svg");


do

 node svgo.js "$file"

done;
