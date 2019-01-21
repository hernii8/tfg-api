#!/bin/bash
model=svm
basedir=..
if [ ! $1 ]
then
	echo "Faltan parametros"
	exit
fi
cd ../../
node createDataset.js "$1"
cd svm/programs/
[ -d "../data" ] || mkdir ../data || exit
[ -d "../data/$1" ] || mkdir ../data/$1 || exit
[ -d "../data/$1/original" ] || mkdir ../data/$1/original || exit
[ -d "../data/$1/folds" ] || mkdir ../data/$1/folds || exit
[ -d "../results" ] || mkdir ../results || exit
[ -d "../results/$1" ] || mkdir ../results/$1 || exit
cp ../../datasets/$1.csv ../data/$1/original || exit
cp ../../input_names.txt ../data/$1/original/$1_input_names.txt || exit
n_lineas=`wc -l < ../../datasets/$1.csv`
/usr/local/bin/matlab/matlab -nosplash -nodisplay -nodesktop -r "create_dataset(\"$1\",$n_lineas)"
args_model='2 C 20 16384 8192 4096 2048 1024 512 256 128 64 32 16 8 4 2 1 0.5 0.25 0.125 0.0625 0.0312 gamma 25 256 128 64 32 16 8 4 2 1 0.5 0.25 0.125 0.0625 0.03125 0.01562 0.00781 0.00391 0.00195  0.00098 0.00049 0.00024 0.00012 0.00006 0.00003 1.5e-5'
# args_model='2 C 2 100 1 gamma 4 1 0.1 0.01 0.001'
interactive=1

clear
./svm $model $basedir $1 $args_model $interactive
cd training
./training $1
cd ..
