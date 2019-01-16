#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <error.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>
#include <sys/time.h>

// #define DEBUG_DATA_READING
// #define DEBUG_PARTITION_READING
// #define DEBUG_ARGUMENT_READING
#define N_VAL_PAR_MAX 30
#define N_PAR_MAX 2

extern void *allocate_vector(int,size_t,const char *);
extern float **allocate_float_matrix(int,int,const char *);
extern char **allocate_char_matrix(int,int,const char *);
extern void deallocate_vector(void *,int,size_t,const char *);
extern void deallocate_float_matrix(float **,int,int,const char *);
extern void deallocate_char_matrix(char **,int,int,const char *);
extern void list_pointers();

extern void start_model(int);
extern void train(float **,int *,int,float,float);
extern void validate(float **,int *,int,int *);
extern void end_model();


struct timeval  t_ini;
float  elapsed_time;
FILE  *f;
FILE  *fm;
float  **xr;
float  **xv;
float  **xt;
float  val1[N_VAL_PAR_MAX];
float  val2[N_VAL_PAR_MAX];
float  **kappa;
float  avg_test_kappa;
float  test_kappa;
float  avg_kappa;
float  std_kappa;
float  best_kappa;
float  best_par1;
float  best_par2;
float  **cm;
float  **avg_cm;
long int  br;       // bytes allocated
int  *dr;
int  *dv;
int  *dt;
int  *ro;
int  kfold;
int  np;
int  ni;
int  nc;
int  indv;  // there are indicator variables?
int  *npr; // no. training patterns per fold
int  *npv;// no. validation patterns per fold
int  *npt; // no. test patterns per fold
int  iexp;
int  npar;
int  n_val1;
int  n_val2;
int  nexp;
int  interactive;
int  schar=sizeof(char);
int  spchar=sizeof(char*);
int  sint=sizeof(int);
int  spint=sizeof(int*);
int  sfloat=sizeof(float);
int  spfloat=sizeof(float*);
int  sdouble=sizeof(double);
char  model[100];
char  tipo[100];
char  par1_name[100];
char  par2_name[100];
char  basedir[200];
char  resultsdir[200];
char  dataset[100];
char  f_res[200];
char  f_plot[200];
char  **class_name;

void ini_time() {
	gettimeofday(&t_ini, NULL);
}

void end_time() {
	struct timeval t_fin;
	time_t  dif_seg, dif_useg;

	gettimeofday(&t_fin, NULL);
	dif_seg = t_fin.tv_sec - t_ini.tv_sec;
	dif_useg = t_fin.tv_usec - t_ini.tv_usec;
	if(dif_useg < 0) {
		dif_seg--; dif_useg += 1e6;
	}
	elapsed_time=dif_seg+1e-6*dif_useg;
}

void read_args(int argc, char *argv[]) {
	int  i, j=1;
   
/*  for(i = 1; i < argc; i++) {
	printf("arg %i: %s\n", i, argv[i]);
  }*/
	strcpy(model,argv[j++]);
	strcpy(basedir,argv[j++]);
	strcpy(dataset,argv[j++]);
	sprintf(f_res,"%s/results/%s/results_%s_%s.dat",basedir,dataset,model,dataset);
	sprintf(f_plot,"%s/results/%s/plot_%s_%s.dat",basedir,dataset,model,dataset);
	
	npar = atoi(argv[j++]);
	if(npar > 0) {
		if(npar > N_PAR_MAX) error(1, errno, "error: npar= %i > %i\n", npar, N_PAR_MAX);
		strcpy(par1_name, argv[j++]); strcpy(par2_name, "ningun");
		n_val1 = atoi(argv[j++]);
		if(n_val1 > N_VAL_PAR_MAX) error(1, errno, "error: n_val1= %i > %i\n", n_val1, N_VAL_PAR_MAX);
		for(i = 0; i < n_val1; i++) val1[i] = atof(argv[j++]);
		#ifdef DEBUG_ARGUMENT_READING
		printf("par %s: %i values: ", par1_name, n_val1);
		for(i = 0; i < n_val1; i++) printf("%g ", val1[i]);
		printf("\n");
		#endif
		if(2 == npar) {
			strcpy(par2_name, argv[j++]);
			n_val2 = atoi(argv[j++]);
			if(n_val2 > N_VAL_PAR_MAX) error(1, errno, "erro: n_val2= %i > %i\n", n_val2, N_VAL_PAR_MAX);
			for(i = 0; i < n_val2; i++) val2[i] = atof(argv[j++]);

			#ifdef DEBUG_ARGUMENT_READING
			printf("par %s: %i values: ", par2_name, n_val2);
			for(i = 0; i < n_val2; i++) printf("%g ", val2[i]);
			printf("\n");
			#endif	  
		}
	} else {
		strcpy(par1_name, "none"); strcpy(par2_name, "none"); 
	}
	interactive = atoi(argv[j]);
	#ifdef DEBUG_ARGUMENT_READING
	exit(0);
	#endif
}


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
	
	sprintf(fich,"%s/data/%s/%s.txt", basedir, dataset, dataset);
	pf=open_file(fich, "r");
	fscanf(pf,"%s %i",s,&np);
	fscanf(pf,"%s %i",s,&ni);
	fscanf(pf,"%s %i",s,&nc);
	class_name=allocate_char_matrix(nc,100,"class_name");
	for(i=0;i<nc;i++) fscanf(pf,"%s %s %s",s,s,class_name[i]);
	fscanf(pf,"%s %i",s,&kfold);
	npr=(int*)allocate_vector(kfold,sint,"npr");
	npv=(int*)allocate_vector(kfold,sint,"npv");
	npt=(int*)allocate_vector(kfold,sint,"npt");
	for(i=0;i<kfold;i++) {
		fscanf(pf,"%s",s);fscanf(pf,"%s",s);
		fscanf(pf,"%s %i",s,&npr[i]);
		fscanf(pf,"%s %i",s,&npv[i]);
		fscanf(pf,"%s %i",s,&npt[i]);
// 		printf("fold=%i npr=%i npv=%i npt=%i\n",i,npr[i],npv[i],npt[i]);
	}
	fclose(pf);	
}

void read_train_fold(int fold) {
	FILE  *pf;
	int  i,j,k,t,nr=npr[fold];
	char  cad[100],f_data[100];

	sprintf(f_data,"%s/data/%s/folds/%s_training_%i.dat",basedir,dataset,dataset,fold+1);
	xr=allocate_float_matrix(nr,ni,"xr");dr=(int*)allocate_vector(nr,sint,"dr");
	pf=open_file(f_data,"r");
	for(i=0;i<ni;i++) fscanf(pf,"%s",cad);
	fscanf(pf,"%s\n",cad);
	for(i=0;i<nr;i++) {
		fscanf(pf,"%i ",&k);
		for(j=0;j<ni;j++) fscanf(pf,"%g ",&xr[i][j]);
		fscanf(pf,"%i\n",&t);dr[i]=t-1;
	}
	fclose(pf);
}

void read_valid_fold(int fold) {
	FILE  *pf;
	int  i,j,k,t,nv=npv[fold];
	char  cad[100],f_data[100];

	sprintf(f_data,"%s/data/%s/folds/%s_validation_%i.dat",basedir,dataset,dataset,fold+1);
	xv=allocate_float_matrix(nv,ni,"xv");dv=(int*)allocate_vector(nv,sint,"dv");
	pf=open_file(f_data,"r");
	for(i=0;i<ni;i++) fscanf(pf,"%s",cad);
	fscanf(pf,"%s\n",cad);
	for(i=0;i<nv;i++) {
		fscanf(pf,"%i ",&k);
		for(j=0;j<ni;j++) fscanf(pf,"%g ",&xv[i][j]);
		fscanf(pf,"%i\n",&t);dv[i]=t-1;
	}
	fclose(pf);
}

void read_test_fold(int fold) {
	FILE  *pf;
	int  i,j,k,t,nt=npt[fold];
	char  cad[100],f_data[100];

	sprintf(f_data,"%s/data/%s/folds/%s_test_%i.dat",basedir,dataset,dataset,fold+1);
	xt=allocate_float_matrix(nt,ni,"xt");dt=(int*)allocate_vector(nt,sint,"dt");
	pf=open_file(f_data,"r");
	for(i=0;i<ni;i++) fscanf(pf,"%s",cad);
	fscanf(pf,"%s\n",cad);
	for(i=0;i<nt;i++) {
		fscanf(pf,"%i ",&k);
		for(j=0;j<ni;j++) fscanf(pf,"%g ",&xt[i][j]);
		fscanf(pf,"%i\n",&t);dt[i]=t-1;
	}
	fclose(pf);
}

void initialize() {	
	read_dataset_info();
	if(0 == npar)
		nexp=kfold;
	else {
		if(1==npar) {
			kappa=(float**)allocate_vector(n_val1,sfloat,"kappa");
			nexp=n_val1*kfold + kfold;
		} else if(2==npar) {
			kappa=allocate_float_matrix(n_val1,n_val2,"kappa");
			nexp=n_val1*n_val2*kfold + kfold;
		}
	}
	iexp=0;

	cm=allocate_float_matrix(nc,nc,"cm");
	avg_cm=allocate_float_matrix(nc,nc,"avg_cm");
	f=open_file(f_res, "w");
	printf("processing dataset %s with classifier %s...\n",dataset,model); 
	fprintf(f,"processing dataset %s with classifier %s...\n",dataset,model); fflush(f);
	if(1==npar)
		fprintf(f, "%15s %15s %15s %15s\n", "progress(%)",par1_name,"kappa(%)","best_kappa"); 
	else if(2==npar)
		fprintf(f, "%15s %15s %15s %15s %15s\n", "progress(%)",par1_name, par2_name,"kappa(%)","best_kappa");
	fflush(f);	
}


float calculate_kappa() {
	float  sum,pa,pe,p1,p2,k;
	int  i,j;
	
// 	for(i=0;i<nc;i++) {
// 		for(j=0;j<nc;j++) printf("%f\t",cm[i][j]);
// 		printf("\n");
// 	}
	for(i=pa=sum=0;i<nc;pa+=cm[i][i],i++)
		for(j=0;j<nc;j++) sum+=cm[i][j];
	for(i=pe=0;i<nc;i++){
		for(j=0,p1=p2=0;j<nc;j++){
			p1+=cm[i][j];p2+=cm[j][i];
		}
		pe+=p1*p2/sum;
	}
	k=100*(pa-pe)/(sum-pe);
	return(k);
}

float run_par_fold(int fold,int ivp1, int ivp2) {
	int  i;
	float  valp1=val1[ivp1],valp2=val2[ivp2],kappa_val;
	
	for(i=0;i<nc;i++) memset(avg_cm[i],0,nc*sfloat);
	train(xr,dr,npr[fold],valp1,valp2);
	validate(xv,dv,npv[fold],ro);
	kappa_val=calculate_kappa();
	if(interactive) fprintf(stderr,"%5.1f%%\r",100.*iexp++/nexp);
	return(kappa_val);
}

void ini_test() {	
	fprintf(f,"testing (kfold=%i)...\n%10s %10s\n",kfold,"fold","kappa(%)");
}

void check_memory() {
	if(br) fprintf(stderr,"WARNING: %ld bytes of memory are not freed\n",br);
	list_pointers();
}

void free_mem() {
	deallocate_float_matrix(cm,nc,nc,"cm");
	deallocate_float_matrix(avg_cm,nc,nc,"avg_cm");
	deallocate_char_matrix(class_name,nc,100,"class_name");
	deallocate_vector(npr,kfold,sint,"npr");deallocate_vector(npv,kfold,sint,"npv");deallocate_vector(npt,kfold,sint,"npt");
	check_memory();
}

void end_test() {
	float  ac,se[nc],pp[nc],s,sf,sc;
	int  i,j;

	for(i=0,avg_test_kappa/=kfold;i<nc;i++)
		for(j=0;j<nc;j++) avg_cm[i][j]/=kfold;
	fprintf(f, "kappa_final= %.2f %%\n",avg_test_kappa);
    for(i=s=0;i<nc;i++) 
        for(j=0;j<nc;j++)
            s+=avg_cm[i][j];
    for(i=0;i<nc;i++) {
        for(j=0;j<nc;j++)
            avg_cm[i][j]=100*avg_cm[i][j]/s;
	}
	for(i=ac=s=0;i<nc;i++)
		for(j=0,ac+=avg_cm[i][i];j<nc;j++)
			s+=avg_cm[i][j];
	fprintf(f, "acerto= %.2f %%\n",100*ac/s);
	fprintf(f, "matriz de confusión (%%)\n%20s ","");
	for(i = 0; i < nc; i++) fprintf(f,"%20s ",class_name[i]);
	fprintf(f,"\n");
	for(i = 0; i < nc; i++) {
		fprintf(f,"%20s ",class_name[i]);
		for(j = 0; j < nc; j++) {
			fprintf(f, "%20.2f ", avg_cm[i][j]);
		}
		fprintf(f, "\n");
	}
	for(i = 0; i < nc; i++) {
		for(j = sf = sc = 0; j < nc; j++) {
			sf += avg_cm[i][j]; sc += avg_cm[j][i];
		}
		se[i] = (sf ? 100*avg_cm[i][i]/sf : 0);
		pp[i] = (sc ? 100*avg_cm[i][i]/sc : 0);
		fprintf(f, "%s: se= %.1f%% sp= %.1f%%\n", class_name[i], se[i], pp[i]);
	}
	free_mem();
}

int main(int argc, char *argv[]) {
	int  i,j,k,nr,nv,nt;

	ini_time();
	read_args(argc, argv);
	initialize();

	if(npar>0) {
		for(i=0,best_kappa=-100;i<kfold;i++) {
			nr=npr[i];nv=npv[i];
			read_train_fold(i);read_valid_fold(i);
			ro=(int*)allocate_vector(nv,sint,"ro");start_model(nr);
			if(1==npar)
				for(j=0;j<n_val1;j++) kappa[j][0]+=run_par_fold(i,j,0);
			else
				for(j=0;j<n_val1;j++)
					for(k=0;k<n_val2;k++) kappa[j][k]+=run_par_fold(i,j,k);
			end_model();
			deallocate_float_matrix(xr,nr,ni,"xr");deallocate_vector(dr,nr,sint,"dr");
			deallocate_float_matrix(xv,nv,ni,"xv");deallocate_vector(dv,nv,sint,"dv");
			deallocate_vector(ro,nv,sint,"ro");
		}
		if(1==npar) {
			for(i=0;i<kfold;i++) {
				kappa[j][0]/=kfold;
				fprintf(f,"best_%s= %g kappa= %.2f%%\n",par1_name,best_par1,best_kappa);
				if(kappa[j][0]>best_kappa) {
					best_kappa=kappa[j][0];best_par1=val1[i];
				}
				fprintf(f,"%15.2f %15g %15.2f %15.2f\n",100.*iexp/nexp,val1[i],kappa[i][0],best_kappa);fflush(f);
			}
			fprintf(f,"best_%s= %g kappa= %.2f%%\n",par1_name,best_par1,best_kappa);
			deallocate_vector(kappa,n_val1,spfloat,"kappa");
		} else {
			for(i=0;i<n_val1;i++) {
				for(j=0;j<n_val2;j++) {
					kappa[i][j]/=kfold;
					if(kappa[i][j]>best_kappa) {
						best_kappa=kappa[i][j];best_par1=val1[i];best_par2=val2[j];
					}
					fprintf(f,"%15.2f %15g %15g %15.2f %15.2f\n",100.*iexp/nexp,val1[i],val2[j],kappa[i][j],best_kappa);fflush(f);
				}
			}
			fprintf(f,"best_%s= %g best_%s= %g kappa= %.2f%%\n",par1_name,best_par1,par2_name,best_par2,best_kappa);
			deallocate_float_matrix(kappa,n_val1,n_val2,"kappa");
		}		
	}
	
	ini_test();
	for(i=avg_test_kappa=0;i<kfold;i++) {
		nr=npr[i];nt=npt[i];
		read_train_fold(i);read_test_fold(i);
		ro=(int*)allocate_vector(nt,sint,"ro");start_model(nr);
		train(xr,dr,nr,best_par1,best_par2);
		validate(xt,dt,nt,ro);end_model();
		deallocate_float_matrix(xr,nr,ni,"xr");deallocate_vector(dr,nr,sint,"dr");
		deallocate_float_matrix(xt,nt,ni,"xt");deallocate_vector(dt,nt,sint,"dt");
		deallocate_vector(ro,nt,sint,"ro");
		test_kappa=calculate_kappa();avg_test_kappa+=test_kappa;
		for(j=0;j<nc;j++)
			for(k=0;k<nc;k++) avg_cm[j][k]+=cm[j][k];
		if(interactive) fprintf(stderr, "%5.1f%%\r", 100.*iexp++/nexp);
		fprintf(f,"%10i %10.2f\n",i+1,test_kappa);fflush(f);
	}
	end_test();
	end_time();fprintf(f,"elapsed time=%g s\n",elapsed_time);fclose(f);
	printf("finished: elapsed time=%g s\n",elapsed_time);
	return(0);
}
