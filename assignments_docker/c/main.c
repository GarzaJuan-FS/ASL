#include <stdio.h>
#include <time.h>
int main(void) {
    time_t t = time(NULL);
    struct tm *tm = localtime(&t);
    char buf[64];
    strftime(buf, sizeof(buf), "%m/%d/%Y %H:%M", tm);
    printf("Hello ASL! - %s\n", buf);
    return 0;
}