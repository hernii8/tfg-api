#include <stdio.h>
#include <errno.h>
#include <error.h>

#include "svm.cpp"

#define CACHE_SIZE 50
#define EPSILON_LIBSVM 0.001

extern void *allocate_vector(int n,size_t tam,const char *msg);
extern void deallocate_vector(void *p,int n,size_t tam,const char *name);

struct svm_problem  prob;
struct svm_parameter  par;
struct svm_model  *svm;
extern float  **cm;
extern int  ni;
extern int  nc;
extern int  sfloat;
extern int  sdouble;
int  snode = sizeof(struct svm_node);
int  spnode = sizeof(struct svm_node *);

void start_model(int np) {
	int  i,m;
	char s[100];

	prob.l=np;prob.y=(double*)allocate_vector(prob.l,sdouble,"prob.y");
	prob.x=(struct svm_node **)allocate_vector(prob.l,spnode,"prob.x");
	for(i=0,m=1+ni;i<prob.l;i++) {
		sprintf(s,"prob.x[%i]",i);prob.x[i]=(struct svm_node *)allocate_vector(m,snode,s);
	}	
	par.svm_type = C_SVC;
	par.kernel_type = RBF;
	par.cache_size = CACHE_SIZE;
	par.eps = EPSILON_LIBSVM;
}

void train(float **x,int *d,int np,float C,float gamma) {
	int  i,j;
	const char  *err_msg;
	
	par.C=(double)C;par.gamma=(double)gamma;
	for(i=0;i<np;i++) {
		for(j=0;j<ni;j++) {
			prob.x[i][j].index=j; prob.x[i][j].value=x[i][j];
		}
		prob.x[i][ni].index=-1;prob.y[i]=d[i];
	}
	err_msg=svm_check_parameter(&prob, &par);
	if(NULL!=err_msg) error_at_line(1, errno, __FILE__, __LINE__,"svm_check_parameter: wrong svm parameters: %s",err_msg);
	svm=svm_train(&prob,&par);
}


void validate(float **x,int *d,int np,int *ro) {
	int  i,j,k;
	struct svm_node  t[1+ni];


    for(i=0;i<nc;i++) memset(cm[i],0,nc*sfloat);
	for(i=0;i<np;i++) {
		for(j=0;j<ni;j++) {
			t[j].index=j;t[j].value=x[i][j];
		}
		t[ni].index=-1;j=d[i];k=svm_predict(svm,t);ro[i]=k;cm[j][k]++;
	}
	svm_free_and_destroy_model(&svm);
}


void end_model() {
	int  i,m=1+ni;
	char  s[100];
	
	for(i=0;i<prob.l;i++) {
		sprintf(s,"prob.x[%i]",i);deallocate_vector(prob.x[i],m,snode,s);
	}
	deallocate_vector(prob.x,prob.l,spnode,"prob.x");deallocate_vector(prob.y,prob.l,sdouble,"prob.y");
}
