#include <stdio.h>
#include <stdlib.h>
#include <string.h>

extern int  schar;
extern int  spchar;
extern int  sint;
extern int  spint;
extern int  sfloat;
extern int  spfloat;

extern long int  br;

struct node {  // node of pointer list
	int  nbytes;
	char *name;
	struct node *next;
};
struct node *first;  // pointer to first node

void add_pointer(const char *name,int nbytes) {
	struct node *q=(struct node*)calloc(1,sizeof(struct node));
	if(! q) {
		fprintf(stderr,"error add_list calloc %s\n",name);
		exit(1);
	}
	q->name=strdup(name);q->nbytes=nbytes;q->next=first;first=q;
}

void *allocate_vector(int n, size_t tam,const char *name) {
	int  nbytes=n*tam;
	void *p;
	
	p=calloc(n,tam);
	if(! p) {
		fprintf(stderr,"error allocate_vector calloc %s\n",name);
		exit(1);
	}
	br+=nbytes;add_pointer(name,nbytes);
	return p;
}

float **allocate_float_matrix(int nf,int nc,const char *name) {
	int i;
	float **p;
	char s[100];
	
	p=(float**)allocate_vector(nf,spfloat,name);
	for(i=0;i<nf;i++) {
		sprintf(s,"%s[%i]",name,i);p[i]=(float*)allocate_vector(nc,sfloat,s);
	}
	return(p);
}

char **allocate_char_matrix(int nf,int nc,const char *name) {
	int i;
	char **p;
	char s[100];
	
	p=(char**)allocate_vector(nf,spchar,name);
	for(i=0;i<nf;i++) {
		sprintf(s,"%s[%i]",name,i);p[i]=(char*)allocate_vector(nc,schar,s);
	}
	return(p);
}

void remove_pointer(const char *name,int nbytes) {
	struct node *q=first,*r=NULL;
	
	while(q) {
		if(!strcmp(q->name,name)) {
			if(q==first) {
				first=q->next;
			} else {
				r->next=q->next;
			}
			if(nbytes!=q->nbytes) {
				printf("error: remove_pointer %s: freeing %i of %i bytes\n",name,nbytes,q->nbytes);exit(1);
			}
			free(q->name);free(q);return;
		} else {
			r=q;q=q->next;
		}
	}
	printf("error: remove_pointer %s: empty pointer list\n",name);exit(1);
}

void deallocate_vector(void *p,int n,size_t tam,const char *name) {
	int  nbytes=n*tam;
	free(p);br-=nbytes;  // reduces the br counter by the array size
	remove_pointer(name,nbytes);
}

void deallocate_float_matrix(float **p,int nf,int nc,const char *name) {
	int i;
	char s[100];
	
	for(i=0;i<nf;i++) {
		sprintf(s,"%s[%i]",name,i);deallocate_vector(p[i],nc,sfloat,s);
	}
	deallocate_vector(p,nf,spfloat,name);
}

void deallocate_char_matrix(char **p,int nf,int nc,const char *name) {
	int i;
	char s[100];
	
	for(i=0;i<nf;i++) {
		sprintf(s,"%s[%i]",name,i);deallocate_vector(p[i],nc,schar,s);
	}
	deallocate_vector(p,nf,spchar,name);
}

void list_pointers() {
	struct node *q=first;

	if(q) {
		printf("pointers to be freed:\n");
		while(q) {
			printf("%s: %i bytes\n",q->name,q->nbytes);
			q=q->next;
		}
	}
}

void *realloc_mem(void *p,int n1,int n2,size_t tam,const char *msg) {
	void *q=realloc(p,n2*tam);
	if(! q) {
		fprintf(stderr,"error realloc: %s\n",msg);
		exit(1);
	}
	br+=(n2-n1)*tam;
	return q;
}
