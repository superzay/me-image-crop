<template>
	<div class="home">
		<!--选择图片-->
		<div style='' class='SltImg'>
			<label>选择要裁剪的图片</label>
			<input @change='getFile($event)' class='' style='' type="file" accept=".jpg,.png,.bmp,.gif"   />
		</div>
		<!--图片裁剪组件-->
		<div v-if='openImgCropPopover' class='ImgCrop' style=''>
			<div style=''>
				<me-image-crop ref='image-crop' @confirm-crop-image='getImg' @cancel-crop-image='cancel' :out-type='outType' :show-btn='showBtn' :image-src='imgSrc'></me-image-crop>
			</div>

		</div>
		<!--裁剪后图片显示-->
		<img v-if='croppedImg' :src="croppedImg" alt="" class='CroppedImg' />

	</div>
</template>

<script>
	export default {
		name: 'home',
		data() {
			return {
				imgSrc: '',
				outType: 'base64', //base64或者blob
				showBtn: true,
				croppedImg: '',
				openImgCropPopover: false,
			}
		},
		created() {

		},
		methods: {
			getImg(img) {
				if(this.outType === 'base64') {
					this.croppedImg = img; //base64
					this.openImgCropPopover = false;
				} else {
					console.dir(img); //blob
					this.openImgCropPopover = false;
				}
			},
			cancel() {
				this.openImgCropPopover = false;
			},
			//读取本地图片
			getFile(event) {

				let inputEl = event.currentTarget;
				let reader = new FileReader();
				reader.onload = () => {
					this.imgSrc = reader.result;
					this.openImgCropPopover = true;
					inputEl.value = ''; //记得清空
				}
				reader.readAsDataURL(inputEl.files[0]);

				//使用me-image-crop组件的getImage方法获取图片
				/*this.showBtn = false;
				setTimeout(() => {
					if(this.outType === 'base64') {
						this.croppedImg = this.$refs["image-crop"].getImage();
						this.openImgCropPopover = false;

					} else {
						this.$refs["image-crop"].getImage((blob) => {
							console.dir(blob);
							this.openImgCropPopover = false;

						});
					}
				}, 5000)*/
			}
		},
	}
</script>

<style scoped lang='scss'>
	.home {
		.SltImg {
			border: 1px solid #b2b2b2;
			width: 100px;
			height: 100px;
			position: relative;
			margin: auto;
			background-image: url(~@/images/jia.png);
			background-size: 100% 100%;
			label {
				position: absolute;
				bottom: -30px;
				left: 50%;
				display: block;
				transform: translateX(-50%);
				white-space: nowrap;
			}
			;
			input {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				opacity: 0;
			}
		}
		;
		.CroppedImg {
			margin: 50px auto 0 auto;
			display: block;
		}
		;
		.ImgCrop {
			position: fixed;
			left: 0;
			top: 0;
			height: 100%;
			width: 100%;
			background: rgba(0, 0, 0, 0.2)

		}
		;
		.ImgCrop>div {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			-ms-transform: translate(-50%, -50%);
			-webkit-transform: translate(-50%, -50%);
			-moz-transform: translate(-50%, -50%);
			width: 100%;
			height: 100%;
			max-width: 500px;
			max-height: 700px;
		}
	}
</style>