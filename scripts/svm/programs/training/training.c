#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <errno.h>

extern void *allocate_vector(int,size_t,const char *);
extern float **allocate_float_matrix(int,int,const char *);
extern char **allocate_char_matrix(int,int,const char *);
extern void deallocate_vector(void *,int,size_t,const char *);
extern void deallocate_float_matrix(float **,int,int,const char *);
extern void deallocate_char_matrix(char **,int,int,const char *);
extern void list_pointers();

extern void start_model(int);
extern void train(float **,int *,int,float,float,char*);
extern void end_model();

float  **x;
float  **cm;
float  C;
float  gamma;
int  *d;
int  schar=sizeof(char);
int  spchar=sizeof(char*);
int  sint=sizeof(int);
int  spint=sizeof(int*);
int  sfloat=sizeof(float);
int  spfloat=sizeof(float*);
int  sdouble=sizeof(double);
int  br;
int  nc;
int  ni;
int  np;
char dataset[100];
char  **class_name;
char  basedir[100];

FILE *open_file(char *file, const char *perm) {
	FILE  *f=fopen(file,perm);
	if(!f) {
		fprintf(stderr, "open_file: error fopen %s: %s\n", file, strerror(errno));
		exit(1);
	}
	return(f);
}

void read_dataset_info() {
	FILE *pf;
	int i;
	char fich[200],s[100];
	
	sprintf(fich,"%s/data/%s/%s.txt",basedir,dataset,dataset);
	pf=open_file(fich, "r");
	fscanf(pf,"%s %i",s,&np);
	fscanf(pf,"%s %i",s,&ni);
	fscanf(pf,"%s %i",s,&nc);
	class_name=allocate_char_matrix(nc,100,"class_name");
	for(i=0;i<nc;i++) fscanf(pf,"%s %s %s",s,s,class_name[i]);
	fclose(pf);	
}

void read_data() {
	FILE  *pf;
	int  i,j,k,t;
	char  cad[100],f_data[100];

	sprintf(f_data,"%s/data/%s/%s.dat",basedir,dataset,dataset);
	x=allocate_float_matrix(np,ni,"x");d=(int*)allocate_vector(np,sint,"d");
	pf=open_file(f_data,"r");
	for(i=0;i<ni;i++) fscanf(pf,"%s",cad);
	fscanf(pf,"%s\n",cad);
	for(i=0;i<np;i++) {
		fscanf(pf,"%i ",&k);
		for(j=0;j<ni;j++) fscanf(pf,"%g ",&x[i][j]);
		fscanf(pf,"%i\n",&t);d[i]=t-1;
	}
	fclose(pf);
}

void read_tunable_pars() {
	FILE  *f;
	char  cmd[200],nf[100];
	
	sprintf(nf,"%s/results/%s/results_svm_%s.dat",basedir,dataset,dataset);
	system(">tmp.txt");
	sprintf(cmd,"grep best_C %s |cut -d= -f2|cut -d' ' -f2 > tmp.txt",nf);system(cmd);
	sprintf(cmd,"grep best_gamma %s |cut -d= -f3|cut -d' ' -f2 >> tmp.txt",nf);system(cmd);
	strcpy(nf,"tmp.txt");f=open_file(nf,"r");
	fscanf(f,"%g",&C);
	fscanf(f,"%g",&gamma);
	fclose(f);
	system("unlink tmp.txt");
}

void free_mem() {
	deallocate_float_matrix(x,np,ni,"x");deallocate_vector(d,np,sint,"d");
}

int main(int argc, char* argv[]) {
	char  nf[100];
	if(argc < 2){ printf("Faltan argumentos"); return(0);}
	strcpy(basedir,"../..");
	strcpy(dataset,argv[1]);	
	read_dataset_info();
	read_data();
	
	read_tunable_pars();
	start_model(np);
	sprintf(nf,"%s/results/%s/svm_%s.dat",basedir,dataset,dataset);
	printf("training on dataset %s and storing SVM ...\n",dataset);
	train(x,d,np,C,gamma,nf);
	end_model();
	
	free_mem();
	printf("finished\n");
	return(0);
}
